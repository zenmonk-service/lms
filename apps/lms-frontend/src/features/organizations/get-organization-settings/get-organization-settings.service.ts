import { GetOrganizationSettingsPayload } from "./get-organization-settings.types";
import { bffClient } from "@/config/client";

export const getOrganizationSettings = (
  payload: GetOrganizationSettingsPayload,
) => {
  const { org_uuid, role_uuid } = payload;
  return bffClient.get(`/organizations/settings`, {
    headers: {
      org_uuid,
    },
    params: {
      role_uuid,
    },
  });
};
