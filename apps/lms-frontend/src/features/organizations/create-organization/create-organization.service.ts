import axiosInterceptorInstance from "@/config/axios";
import { CreateOrganizationPayload } from "./create-organization.types";

export const createOrganization = (payload: CreateOrganizationPayload) => {
  return axiosInterceptorInstance.post(`/organizations`, payload);
};
