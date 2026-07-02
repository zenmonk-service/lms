import axiosInterceptorInstance from "@/config/axios";
import { ActivateOrganizationPayload } from "./activate-organization.types";

export const activateOrganization = (payload: ActivateOrganizationPayload) => {
  const { org_uuid } = payload;
  return axiosInterceptorInstance.patch(`/organizations/${org_uuid}/activate`);
};
