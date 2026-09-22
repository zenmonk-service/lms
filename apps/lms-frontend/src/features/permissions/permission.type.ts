import {
  Permission as CommonPermission,
  Action as CommonAction,
} from "@repo/common";
import type { PaginationState } from "../user/user.type";

export const PermissionTag = CommonPermission.ENUM;
export type PermissionTag =
  (typeof CommonPermission.ENUM)[keyof typeof CommonPermission.ENUM];

export const PermissionAction = CommonAction.ENUM;
export type PermissionAction =
  (typeof CommonAction.ENUM)[keyof typeof CommonAction.ENUM];

export interface Permission {
  uuid: string;
  name: string;
  tag: PermissionTag;
  action: PermissionAction;
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
export enum PermissionActionType {
  LIST_ORGANIZATION_PERMISSIONS = "permissions/listOrganizationPermissions",
  LIST_ROLE_PERMISSIONS = "permissions/listRolePermissions",
  UPDATE_ROLE_PERMISSIONS = "permissions/updateRolePermissions",
}

export type { listPermissionPayload } from "./list-organization-permissions/list-organization-permissions.types";
export type { listRolePermission } from "./list-role-permissions/list-role-permissions.types";
export type { updateRolePermission } from "./update-role-permissions/update-role-permissions.types";
