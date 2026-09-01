import type { PaginationState } from "../user/user.type";

export enum PermissionTag {
  USER_MANAGEMENT = "user_management",
  USER_ATTENDANCE_MANAGEMENT = "user_attendance_management",
  ROLE_MANAGEMENT = "role_management",
  ORGANIZATION_EVENT_MANAGEMENT = "organization_event_management",
  ORGANIZATION_HOLIDAY_MANAGEMENT = "organization_holiday_management",
  ORGANIZATION_SETTING_MANAGEMENT = "organization_setting_management",
  LEAVE_REQUEST_MANAGEMENT = "leave_request_management",
  LEAVE_TYPE_MANAGEMENT = "leave_type_management",
  LEAVE_REPORT_MANAGEMENT = "leave_report_management",
  HOLIDAY_MANAGEMENT = "holiday_management",
  ATTENDANCE_REPORT_MANAGEMENT = "attendance_report_management",
  PAYROLL_MANAGEMENT = "payroll_management",
}

export enum PermissionAction {
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",
  APPROVE = "approve",
  ACTIVATE = "activate",
  CREATE_BULK = "create_bulk",
  REPORT = "report",
  SLA = "sla",
}

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
