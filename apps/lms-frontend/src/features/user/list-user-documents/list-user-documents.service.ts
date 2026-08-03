import { bffClient } from "@/config/client";

export const listUserDocuments = (org_uuid: string, user_uuid: string) => {
  return bffClient.get(`/users/${user_uuid}/documents`, {
    headers: {
      org_uuid,
    },
  });
};
