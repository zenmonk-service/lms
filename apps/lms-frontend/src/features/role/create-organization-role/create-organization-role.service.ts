import axiosInterceptorInstance from "@/config/axios";
import { createRolePayload } from "./create-organization-role.types";

export const createOrganizationRole = (payload: createRolePayload) => {
  return axiosInterceptorInstance.post(`/organizations/roles`, payload, {
    headers: {
      org_uuid: payload.org_uuid,
    },
  });
};
