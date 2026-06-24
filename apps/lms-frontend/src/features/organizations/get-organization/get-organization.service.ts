import axiosInterceptorInstance from "@/config/axios";
import { GetOrganizationPayload } from "./get-organization.types";

export const getOrganization = (payload: GetOrganizationPayload) => {
  const { org_uuid } = payload;
  return axiosInterceptorInstance.get(`/organizations/${org_uuid}`);
};
