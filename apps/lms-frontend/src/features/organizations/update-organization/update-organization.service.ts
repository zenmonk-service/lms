import { UpdateOrganizationPayload } from "./update-organization.types";
import { bffClient } from "@/config/client";

export const updateOrganization = (payload: UpdateOrganizationPayload) => {
  const { org_uuid, ...data } = payload;
  return bffClient.put(`/organizations/${org_uuid}`, data);
};
