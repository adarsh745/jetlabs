import { z } from "zod";
import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";
import type { LoginResponse } from "@/types";
import { loginSchema } from "@/validations";

export const runtime = "nodejs";

function getValidationDetails(error: z.ZodError) {
  const details: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = typeof issue.path[0] === "string" ? issue.path[0] : "form";
    const existing = details[field] ?? [];
    details[field] = [...existing, issue.message];
  }

  return details;
}

function getRequestMetadata(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ipAddress =
    forwardedFor?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    null;
  const userAgent = request.headers.get("user-agent")?.trim() ?? null;

  return {
    ipAddress,
    userAgent,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as unknown;
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return apiError({
        code: "VALIDATION_ERROR",
        message: "Please correct the highlighted fields and try again.",
        status: 422,
        details: getValidationDetails(validation.error),
      });
    }

    const { email, password } = validation.data;
    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return apiError({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password.",
        status: 401,
      });
    }

    if (!user.isActive) {
      return apiError({
        code: "UNAUTHORIZED",
        message: "Your account is not allowed to access this application.",
        status: 403,
      });
    }

    await db.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });

    const sessionResult = await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      ...getRequestMetadata(request),
    });

    const response = apiSuccess<LoginResponse>({
      session: sessionResult.session,
    });

    return setSessionCookie(
      response,
      sessionResult.token,
      sessionResult.session.expiresAt,
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return apiError({
        code: "INVALID_REQUEST_BODY",
        message: "Send a valid JSON payload.",
        status: 400,
      });
    }

    return apiError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Unable to sign you in right now.",
      status: 500,
    });
  }
}
