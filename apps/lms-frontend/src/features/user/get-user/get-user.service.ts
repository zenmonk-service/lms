import { GetUserPayload } from "./get-user.types";
import { bffClient } from "@/config/client";

export const getUser = (payload: GetUserPayload) => {
  const { user_uuid, org_uuid } = payload;
  return bffClient.get(`/users/${user_uuid}`, {
    headers: { org_uuid },
  });
};
