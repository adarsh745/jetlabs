const DEFAULT_AUTH_SECRET = "development-auth-secret-change-me";
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

const encoder = new TextEncoder();

function parsePositiveInteger(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export const AUTH_COOKIE_NAME =
  process.env.AUTH_COOKIE_NAME?.trim() || "syntra.session";

export const AUTH_ISSUER = "syntra";
export const AUTH_AUDIENCE = "syntra-app";

export const SESSION_MAX_AGE_SECONDS = parsePositiveInteger(
  process.env.AUTH_SESSION_MAX_AGE_SECONDS,
  DEFAULT_SESSION_MAX_AGE_SECONDS,
);

export function getAuthSecret() {
  const configuredSecret = process.env.AUTH_SECRET?.trim();

  if (configuredSecret) {
    return encoder.encode(configuredSecret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET must be configured in production.");
  }

  return encoder.encode(DEFAULT_AUTH_SECRET);
}

export function getSessionExpiryDate() {
  return new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
}

export function getSessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}
