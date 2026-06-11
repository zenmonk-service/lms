import axiosInterceptorInstance from "@/config/axios";
import { UpdateOrganizationPayload } from "./update-organization.types";

export const updateOrganization = (payload: UpdateOrganizationPayload) => {
  const { org_uuid, ...data } = payload;
  return axiosInterceptorInstance.put(`/organizations/${org_uuid}`, data);
};
