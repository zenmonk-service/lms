import { DeleteOrganizationPayload } from "./delete-organization.types";
import { bffClient } from "@/config/client";

export const deleteOrganization = (payload: DeleteOrganizationPayload) => {
  const { org_uuid } = payload;
  return bffClient.delete(`/organizations/${org_uuid}`);
};
