import type { NextRequest } from "next/server";
import { apiSuccess } from "@/lib/api/response";
import { AUTH_COOKIE_NAME } from "@/lib/auth/config";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { clearSessionCookie, deleteSession } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null;

    if (token) {
      const verified = await verifyAuthToken(token);

      if (verified.valid) {
        await deleteSession(verified.payload.sid);
      }
    }
  } catch {
    // Always clear the browser cookie even if the backing session cleanup fails.
  }

  return clearSessionCookie(
    apiSuccess({
      signedOut: true,
    }),
  );
}
