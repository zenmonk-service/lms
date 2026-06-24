import axiosInterceptorInstance from "@/config/axios";
import { ListOrganizationUsersPayload } from "./list-organization-users.types";

export const listOrganizationUsers = (payload: ListOrganizationUsersPayload) => {
  const { org_uuid } = payload;
  return axiosInterceptorInstance.get(
    `/organizations/${org_uuid}/users`
  );
};