import axiosInterceptorInstance from "@/config/axios";
import { listPermissionPayload, listRolePermission, updateRolePermission } from "./permission.type";

export const listOrganizationPermissions = (payload:listPermissionPayload ) => {
  return axiosInterceptorInstance.get(`/organizations/permissions`, {
    headers: {
      org_uuid: payload.org_uuid,
    },
    params: {
      page: payload?.pagination?.page,
      limit: payload?.pagination?.limit,
      search: payload?.pagination?.search,
    },
  });
};


export const listRolePermissions = (payload:listRolePermission ) => {
  return axiosInterceptorInstance.get(`/organizations/roles/${payload.role_uuid}/permissions`, {
    headers: {
      org_uuid: payload.org_uuid,
    },
  });
};


export const updateRolePermissions = (payload: updateRolePermission) => {
  return axiosInterceptorInstance.put(
    `/organizations/roles/${payload.role_uuid}/permissions`,
    { permission_uuids: payload.permission_uuids }, 
    {
      headers: {
        org_uuid: payload.org_uuid,
      },
    }
  );
};