
import { bffClient } from "@/config/client";
import { UpdateRolePayload } from "./update-role.type";

export const updateOrganizationRole = (payload: UpdateRolePayload) => {
  return bffClient.put(`/roles/${payload.role_uuid}`, payload, {
    headers: {
      org_uuid: payload.org_uuid,
    },
  });
};
