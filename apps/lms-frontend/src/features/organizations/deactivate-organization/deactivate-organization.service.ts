import axiosInterceptorInstance from "@/config/axios";
import { DeactivateOrganizationPayload } from "./deactivate-organization.types";

export const deactivateOrganization = (payload: DeactivateOrganizationPayload) => {
  const { org_uuid } = payload;
  return axiosInterceptorInstance.patch(`/organizations/${org_uuid}/deactivate`);
};
