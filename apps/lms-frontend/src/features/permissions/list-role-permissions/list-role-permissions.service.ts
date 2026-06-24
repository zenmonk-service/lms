import axiosInterceptorInstance from "@/config/axios";
import { listRolePermission } from "./list-role-permissions.types";

export const listRolePermissions = (payload: listRolePermission) => {
  return axiosInterceptorInstance.get(
    `/organizations/roles/${payload.role_uuid}/permissions`,
    {
      headers: {
        org_uuid: payload.org_uuid,
      },
    },
  );
};
