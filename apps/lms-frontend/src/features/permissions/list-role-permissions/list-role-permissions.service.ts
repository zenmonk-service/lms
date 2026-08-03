import { listRolePermission } from "./list-role-permissions.types";
import { bffClient } from "@/config/client";

export const listRolePermissions = (payload: listRolePermission) => {
  return bffClient.get(
    `/roles/${payload.role_uuid}/permissions`,
    {
      headers: {
        org_uuid: payload.org_uuid,
      },
    },
  );
};
