export interface listRolePermission {
  org_uuid: string;
  role_uuid: string;
  isCurrentUserRolePermissions?: boolean;
  is_me: string;
}
