import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth/config";
import { verifyAuthToken } from "@/lib/auth/jwt";
import { isProtectedPath } from "@/lib/auth/routing";

function redirectToLogin(request: NextRequest, reason: "expired" | "unauthorized") {
  const { pathname, search } = request.nextUrl;
  const loginUrl = new URL("/login", request.url);

  loginUrl.searchParams.set("reason", reason);
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return redirectToLogin(request, "unauthorized");
  }

  const verified = await verifyAuthToken(token);

  if (!verified.valid) {
    const response = redirectToLogin(
      request,
      verified.reason === "expired" ? "expired" : "unauthorized",
    );

    response.cookies.set(AUTH_COOKIE_NAME, "", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      maxAge: 0,
    });

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
