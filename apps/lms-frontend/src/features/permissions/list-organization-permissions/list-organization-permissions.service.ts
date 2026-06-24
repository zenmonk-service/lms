import axiosInterceptorInstance from "@/config/axios";
import { listPermissionPayload } from "./list-organization-permissions.types";

export const listOrganizationPermissions = (
  payload: listPermissionPayload,
) => {
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
