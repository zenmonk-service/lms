import type { PaginationState } from "../user/user.type";

export interface Permission {
  uuid: string;
  name: string;
  tag: string;
  action: string;
  description: string;
}

export interface PermissionState {
  isLoading: boolean;
  error: string | null;
  permissions: Permission[];
  rolePermissions: { role_permissions: Permission[] };
  currentUserRolePermissions: Permission[];
  total: number;
  currentPage: number;
  pagination: PaginationState;
}

export type { listPermissionPayload } from "./list-organization-permissions/list-organization-permissions.types";
export type { listRolePermission } from "./list-role-permissions/list-role-permissions.types";
export type { updateRolePermission } from "./update-role-permissions/update-role-permissions.types";
