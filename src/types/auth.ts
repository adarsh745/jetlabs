/**
 * Authentication and authorization types.
 * These mirror the Prisma User and Session models.
 */

export const USER_ROLES = ["STUDENT", "FACULTY", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  expiresAt: string;
  user: AuthUser;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginResponse = {
  session: Session;
};

/**
 * Route-level permission mapping.
 * Used by route guards and redirects.
 */
export type RoutePermission = {
  path: string;
  roles: UserRole[];
};

export const ROUTE_PERMISSIONS: RoutePermission[] = [
  { path: "/student", roles: ["STUDENT"] },
  { path: "/faculty", roles: ["FACULTY"] },
  { path: "/admin", roles: ["ADMIN"] },
];
