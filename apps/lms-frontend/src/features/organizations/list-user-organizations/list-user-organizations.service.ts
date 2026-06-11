import axiosInterceptorInstance from "@/config/axios";
import { ListUserOrganizationsPayload } from "./list-user-organizations.types";

export const listUserOrganizations = (
  payload: ListUserOrganizationsPayload,
) => {
  const { uuid, params } = payload;
  return axiosInterceptorInstance.get(`/users/${uuid}/organizations`, {
    params,
  });
};
