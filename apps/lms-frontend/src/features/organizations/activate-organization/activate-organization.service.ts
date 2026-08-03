import { ActivateOrganizationPayload } from "./activate-organization.types";
import { bffClient } from "@/config/client";

export const activateOrganization = (payload: ActivateOrganizationPayload) => {
  const { org_uuid } = payload;
  return bffClient.patch(`/organizations/${org_uuid}/activate`);
};
