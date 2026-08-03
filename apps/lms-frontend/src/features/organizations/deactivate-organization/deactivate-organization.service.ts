import { DeactivateOrganizationPayload } from "./deactivate-organization.types";
import { bffClient } from "@/config/client";

export const deactivateOrganization = (payload: DeactivateOrganizationPayload) => {
  const { org_uuid } = payload;
  return bffClient.patch(`/organizations/${org_uuid}/deactivate`);
};
