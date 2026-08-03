import { ListOrganizationPayload } from "./list-organization.types";
import { bffClient } from "@/config/client";

export const listOrganizations = (payload: ListOrganizationPayload) => {
  const { params } = payload;
  return bffClient.get(`/organizations`, {
    params,
  });
};
