import { ActiveUserActionType } from "./activate-user.type";
import { bffClient } from "@/config/client";

export const activateUser = (payload: ActiveUserActionType) => {
  return bffClient.patch(`/users/${payload?.user_uuid}/activate`,
     null, {
    headers: {
      org_uuid: payload?.org_uuid,
    },
  });
};