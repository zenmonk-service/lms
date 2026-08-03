import { listPermissionPayload } from "./list-organization-permissions.types";
import { bffClient } from "@/config/client";

export const listOrganizationPermissions = (
  payload: listPermissionPayload,
) => {
  return bffClient.get(`/permissions`, {
    headers: {
      org_uuid: payload.org_uuid,
    },
    params: {
      page: payload?.pagination?.page,
      limit: payload?.pagination?.limit,
      search: payload?.pagination?.search,
    },
  });
};
