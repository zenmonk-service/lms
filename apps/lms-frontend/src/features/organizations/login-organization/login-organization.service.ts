import axiosInterceptorInstance from "@/config/axios";
import { LoginOrganizationPayload } from "./login-organization.types";

export const loginOrganization = (payload: LoginOrganizationPayload) => {
  return axiosInterceptorInstance.post(`/organizations/login`, payload);
};