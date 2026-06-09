import axiosInterceptorInstance from "@/config/axios";
import { listRolePayload } from "./list-organization-roles.types";

export const getOrganizationRoles = (payload: listRolePayload) => {
  return axiosInterceptorInstance.get(`/organizations/roles`, {
    headers: {
      org_uuid: payload.org_uuid,
    },
  });
};
