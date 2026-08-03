import { bffClient } from "@/config/client";

export const getOrganizationUser = (user_uuid: string, org_uuid: string) => {
  return bffClient.get(`/organizations/users/${user_uuid}`, {
    headers: {
      org_uuid,
    },
  });
};
