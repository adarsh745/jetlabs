import { SignJWT, errors, jwtVerify, type JWTPayload } from "jose";
import {
  AUTH_AUDIENCE,
  AUTH_ISSUER,
  getAuthSecret,
} from "@/lib/auth/config";
import type { UserRole } from "@/types/auth";

export type VerifiedAuthToken = JWTPayload & {
  sub: string;
  sid: string;
  email: string;
  role: UserRole;
};

type SignAuthTokenInput = {
  userId: string;
  sessionId: string;
  email: string;
  role: UserRole;
  expiresAt: Date;
};

export async function signAuthToken({
  userId,
  sessionId,
  email,
  role,
  expiresAt,
}: SignAuthTokenInput) {
  return new SignJWT({
    sid: sessionId,
    email,
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuer(AUTH_ISSUER)
    .setAudience(AUTH_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(getAuthSecret());
}

export async function verifyAuthToken(token: string): Promise<
  | {
      valid: true;
      payload: VerifiedAuthToken;
    }
  | {
      valid: false;
      reason: "expired" | "invalid";
    }
> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      issuer: AUTH_ISSUER,
      audience: AUTH_AUDIENCE,
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.sid !== "string" ||
      typeof payload.email !== "string" ||
      (payload.role !== "STUDENT" &&
        payload.role !== "FACULTY" &&
        payload.role !== "ADMIN")
    ) {
      return {
        valid: false,
        reason: "invalid",
      };
    }

    return {
      valid: true,
      payload: payload as VerifiedAuthToken,
    };
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      return {
        valid: false,
        reason: "expired",
      };
    }

    if (error instanceof errors.JOSEError) {
      return {
        valid: false,
        reason: "invalid",
      };
    }

    throw error;
  }
}
