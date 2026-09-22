import { ENUM } from "../enum";

// Sourced from apps/lms-backend/models/public/user/enum/public-user-role-enum.js
// — a public-schema (cross-organization) role, distinct from the tenant
// "role" model used for org-scoped permissions.
export class PublicUserRole extends ENUM {
  static ENUM = {
    SUPERADMIN: "superadmin",
    USER: "user",
    ADMIN: "admin",
  } as const;
}

export type PublicUserRoleType =
  (typeof PublicUserRole.ENUM)[keyof typeof PublicUserRole.ENUM];
