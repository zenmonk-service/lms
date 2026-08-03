import { UpdateOrganizationSettingsPayload } from "./update-organization-settings.types";
import { bffClient } from "@/config/client";

export const updateOrganizationSettings = (payload: UpdateOrganizationSettingsPayload) => {
  const { org_uuid, ...data } = payload;
  return bffClient.put(`/organizations/settings`, data, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};
