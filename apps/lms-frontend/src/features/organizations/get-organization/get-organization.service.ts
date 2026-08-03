import { GetOrganizationPayload } from "./get-organization.types";
import { bffClient } from "@/config/client";

export const getOrganization = (payload: GetOrganizationPayload) => {
  const { org_uuid } = payload;
  return bffClient.get(`/organizations/${org_uuid}`);
};
