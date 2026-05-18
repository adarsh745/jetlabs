import { apiError, apiSuccess } from "@/lib/api/response";
import { getSession } from "@/lib/auth/session";
import type { LoginResponse } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return apiError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to continue.",
      status: 401,
    });
  }

  return apiSuccess<LoginResponse>({
    session,
  });
}
