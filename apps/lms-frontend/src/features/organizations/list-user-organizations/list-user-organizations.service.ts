import { ListUserOrganizationsPayload } from "./list-user-organizations.types";
import { bffClient } from "@/config/client";

export const listUserOrganizations = (
  payload: ListUserOrganizationsPayload,
) => {
  const { uuid, params } = payload;
  const searchParams = new URLSearchParams(params as Record<string, string>);
  return bffClient.get(`/users/${uuid}/organizations?${searchParams.toString()}`);
};
