import {
  getDefaultDashboardPath,
  getSafeCallbackUrl,
} from "@/lib/auth/routing";
import type { ApiResponse, LoginResponse } from "@/types";
import type { LoginInput } from "@/validations";

type AuthFailureCode =
  | "INVALID_CREDENTIALS"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "UNKNOWN_ERROR";

type LoginSuccess = {
  success: true;
  redirectTo: string;
};

type AuthFailure = {
  success: false;
  code: AuthFailureCode;
  message: string;
  status?: number;
};

export type LoginResult = LoginSuccess | AuthFailure;

export type SignOutResult =
  | {
      success: true;
    }
  | AuthFailure;

async function parseApiResponse<T>(response: Response) {
  try {
    return (await response.json()) as ApiResponse<T>;
  } catch {
    return null;
  }
}

function normalizeApiFailure<T>(
  status: number,
  payload: ApiResponse<T> | null,
): AuthFailure {
  if (payload && !payload.success) {
    if (status === 401) {
      return {
        success: false,
        code: "INVALID_CREDENTIALS",
        message: payload.error.message || "Invalid email or password.",
        status,
      };
    }

    if (status === 403) {
      return {
        success: false,
        code: "UNAUTHORIZED",
        message:
          payload.error.message ||
          "Your account is not allowed to access this application.",
        status,
      };
    }

    if (status === 422) {
      return {
        success: false,
        code: "VALIDATION_ERROR",
        message:
          payload.error.message ||
          "Please correct the highlighted fields and try again.",
        status,
      };
    }

    if (status >= 500) {
      return {
        success: false,
        code: "SERVER_ERROR",
        message:
          payload.error.message ||
          "The server could not complete your sign-in request. Please try again.",
        status,
      };
    }

    return {
      success: false,
      code: "UNKNOWN_ERROR",
      message: payload.error.message || "We could not sign you in. Please try again.",
      status,
    };
  }

  if (status >= 500) {
    return {
      success: false,
      code: "SERVER_ERROR",
      message: "The server could not complete your sign-in request. Please try again.",
      status,
    };
  }

  return {
    success: false,
    code: "UNKNOWN_ERROR",
    message: "We could not sign you in. Please try again.",
    status,
  };
}

function normalizeUnexpectedFailure(error: unknown): AuthFailure {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("failed")
    ) {
      return {
        success: false,
        code: "NETWORK_ERROR",
        message:
          "We could not reach the server. Check your connection and try again.",
      };
    }
  }

  return {
    success: false,
    code: "UNKNOWN_ERROR",
    message: "We could not sign you in. Please try again.",
  };
}

export async function loginWithEmailPassword(
  credentials: LoginInput,
  options?: {
    callbackUrl?: string | null;
  },
): Promise<LoginResult> {
  const callbackUrl = getSafeCallbackUrl(options?.callbackUrl);

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(credentials),
    });
    const payload = await parseApiResponse<LoginResponse>(response);

    if (!response.ok || !payload || !payload.success) {
      return normalizeApiFailure(response.status, payload);
    }

    return {
      success: true,
      redirectTo:
        callbackUrl ?? getDefaultDashboardPath(payload.data.session.user.role),
    };
  } catch (error) {
    return normalizeUnexpectedFailure(error);
  }
}

export async function signOutFromSession(): Promise<SignOutResult> {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        accept: "application/json",
      },
    });
    const payload = await parseApiResponse<{ signedOut: boolean }>(response);

    if (response.status === 401) {
      return { success: true };
    }

    if (!response.ok || !payload || !payload.success) {
      return normalizeApiFailure(response.status, payload);
    }

    return { success: true };
  } catch (error) {
    return normalizeUnexpectedFailure(error);
  }
}
