import axiosInterceptorInstance from "@/config/axios";
import { ListOrganizationPayload } from "./list-organization.types";

export const listOrganizations = (payload: ListOrganizationPayload) => {
  const { params } = payload;
  return axiosInterceptorInstance.get(`/organizations`, {
    params,
  });
};
