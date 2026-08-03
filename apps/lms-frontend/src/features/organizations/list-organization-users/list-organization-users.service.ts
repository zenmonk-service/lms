import { ListOrganizationUsersPayload } from "./list-organization-users.types";
import { bffClient } from "@/config/client";

export const listOrganizationUsers = (payload: ListOrganizationUsersPayload) => {
  const { org_uuid } = payload;
  return bffClient.get(
    `/organizations/${org_uuid}/users`
  );
};