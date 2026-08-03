import { ListUserOrganizationsPayload } from "./list-user-organizations.types";
import { bffClient } from "@/config/client";

export const listUserOrganizations = (
  payload: ListUserOrganizationsPayload,
) => {
  const { uuid, params } = payload;
  return bffClient.get(`/users/${uuid}/organizations`,{
    params,
  });
};
