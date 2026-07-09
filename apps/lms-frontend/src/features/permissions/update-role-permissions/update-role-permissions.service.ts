import axiosInterceptorInstance from "@/config/axios";
import { updateRolePermission } from "./update-role-permissions.types";

export const updateRolePermissions = (payload: updateRolePermission) => {
  return axiosInterceptorInstance.put(
    `/roles/${payload.role_uuid}/permissions`,
    { permission_uuids: payload.permission_uuids },
    {
      headers: {
        org_uuid: payload.org_uuid,
      },
    },
  );
};
