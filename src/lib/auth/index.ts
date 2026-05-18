export {
  AUTH_AUDIENCE,
  AUTH_COOKIE_NAME,
  AUTH_ISSUER,
  SESSION_MAX_AGE_SECONDS,
  getAuthSecret,
  getSessionCookieOptions,
  getSessionExpiryDate,
} from "./config";
export {
  signAuthToken,
  verifyAuthToken,
  type VerifiedAuthToken,
} from "./jwt";
export { hashPassword, verifyPassword } from "./password";
export {
  clearSessionCookie,
  createSession,
  deleteSession,
  getSession,
  getSessionUserRole,
  requirePageRole,
  requirePageSession,
  requireRole,
  requireSession,
  setSessionCookie,
  type AuthSession,
  type AuthSessionUser,
  AuthError,
} from "./session";
export {
  DASHBOARD_PATHS,
  getDefaultDashboardPath,
  getRoleForPath,
  getSafeCallbackUrl,
  isProtectedPath,
  isUserRole,
} from "./routing";
