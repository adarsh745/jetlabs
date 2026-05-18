import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getSessionCookieOptions, getSessionExpiryDate } from "./config";
import { signAuthToken, verifyAuthToken } from "./jwt";
import { getDefaultDashboardPath } from "./routing";
import { db } from "@/lib/db";
import type { AuthUser, Session as AppSession, UserRole } from "@/types/auth";

const authUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  emailVerified: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const persistedSessionSelect = {
  id: true,
  expiresAt: true,
  revokedAt: true,
  user: {
    select: authUserSelect,
  },
} satisfies Prisma.SessionSelect;

type PersistedSession = Prisma.SessionGetPayload<{
  select: typeof persistedSessionSelect;
}>;

export type AuthSession = AppSession;
export type AuthSessionUser = AuthUser;

export class AuthError extends Error {
  code: "UNAUTHORIZED" | "FORBIDDEN";
  status: 401 | 403;

  constructor(code: "UNAUTHORIZED" | "FORBIDDEN", status: 401 | 403) {
    super(
      code === "UNAUTHORIZED"
        ? "You must be signed in to continue."
        : "You do not have permission to access this resource.",
    );
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

function mapAuthUser(user: PersistedSession["user"]): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified: user.emailVerified,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

function mapSession(session: PersistedSession): AppSession {
  return {
    id: session.id,
    expiresAt: session.expiresAt.toISOString(),
    user: mapAuthUser(session.user),
  };
}

async function getPersistedSession(token: string | null) {
  if (!token) {
    return null;
  }

  const verified = await verifyAuthToken(token);

  if (!verified.valid) {
    return null;
  }

  return db.session.findFirst({
    where: {
      id: verified.payload.sid,
      userId: verified.payload.sub,
      expiresAt: {
        gt: new Date(),
      },
      revokedAt: null,
    },
    select: persistedSessionSelect,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
  const session = await getPersistedSession(token);

  if (!session || !session.user.isActive) {
    return null;
  }

  return mapSession(session);
}

export function getSessionUserRole(
  session: { user?: { role?: unknown } } | null | undefined,
) {
  const role = session?.user?.role;

  if (role === "STUDENT" || role === "FACULTY" || role === "ADMIN") {
    return role;
  }

  return null;
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    throw new AuthError("UNAUTHORIZED", 401);
  }

  return session;
}

export async function requireRole(...roles: UserRole[]) {
  const session = await requireSession();
  const userRole = getSessionUserRole(session);

  if (!userRole || !roles.includes(userRole)) {
    throw new AuthError("FORBIDDEN", 403);
  }

  return session;
}

export async function requirePageSession(loginPath = "/login?reason=expired") {
  const session = await getSession();

  if (!session) {
    redirect(loginPath);
  }

  return session;
}

export async function requirePageRole(...roles: UserRole[]) {
  const session = await requirePageSession();
  const userRole = getSessionUserRole(session);

  if (!userRole) {
    redirect("/login?reason=expired");
  }

  if (!roles.includes(userRole)) {
    redirect(getDefaultDashboardPath(userRole));
  }

  return session;
}

export async function createSession(input: {
  userId: string;
  email: string;
  role: UserRole;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const expiresAt = getSessionExpiryDate();

  const persistedSession = await db.session.create({
    data: {
      userId: input.userId,
      expiresAt,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
    select: persistedSessionSelect,
  });

  const token = await signAuthToken({
    userId: input.userId,
    sessionId: persistedSession.id,
    email: input.email,
    role: input.role,
    expiresAt,
  });

  return {
    token,
    session: mapSession(persistedSession),
  };
}

export async function deleteSession(sessionId: string) {
  if (!sessionId) {
    return;
  }

  await db.session.updateMany({
    where: {
      id: sessionId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export function setSessionCookie(
  response: NextResponse,
  token: string,
  expiresAt: string | Date,
) {
  response.cookies.set(
    AUTH_COOKIE_NAME,
    token,
    getSessionCookieOptions(
      expiresAt instanceof Date ? expiresAt : new Date(expiresAt),
    ),
  );

  return response;
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getSessionCookieOptions(new Date(0)),
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
