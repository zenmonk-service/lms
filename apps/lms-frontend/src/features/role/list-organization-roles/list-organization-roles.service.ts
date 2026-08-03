import { listRolePayload } from "./list-organization-roles.types";
import { bffClient } from "@/config/client";

export const getOrganizationRoles = (payload: listRolePayload) => {
  return bffClient.get(`/roles`, {
    headers: {
      org_uuid: payload.org_uuid,
    },
  });
};
