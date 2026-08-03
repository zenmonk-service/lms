import { updateRolePermission } from "./update-role-permissions.types";
import { bffClient } from "@/config/client";

export const updateRolePermissions = (payload: updateRolePermission) => {
  return bffClient.put(
    `/roles/${payload.role_uuid}/permissions`,
    { permission_uuids: payload.permission_uuids },
    {
      headers: {
        org_uuid: payload.org_uuid,
      },
    },
  );
};
