import { PaginationState } from "../user/user.slice";
import { Permission } from "./permission.slice";

export interface listPermissionPayload {
  org_uuid: string;
  pagination?: PaginationState;
}

export interface listRolePermission {
  org_uuid: string;
  role_uuid: string;
  isCurrentUserRolePermissions?: boolean;
}


export interface updateRolePermission {
  org_uuid: string;
  role_uuid: string;
  permission_uuids: string[];
}