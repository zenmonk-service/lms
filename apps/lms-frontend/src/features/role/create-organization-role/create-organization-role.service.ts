import { createRolePayload } from "./create-organization-role.types";
import { bffClient } from "@/config/client";

export const createOrganizationRole = (payload: createRolePayload) => {
  return bffClient.post(`/roles`, payload, {
    headers: {
      org_uuid: payload.org_uuid,
    },
  });
};
