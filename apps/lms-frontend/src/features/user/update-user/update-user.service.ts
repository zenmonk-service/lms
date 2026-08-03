import { UpdateUserPayload } from "./update-user.types";
import { bffClient } from "@/config/client";

export const updateUser = (
  payload: Partial<UpdateUserPayload> & { org_uuid: string; user_uuid: string },
) => {
  const { org_uuid, user_uuid, ...rest } = payload;
  return bffClient.put(`/users/${user_uuid}`, rest, {
    headers: { org_uuid },
  });
};
