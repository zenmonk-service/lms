import { DeactivateUserActionType } from "./deactivate-user.type";
import { bffClient } from "@/config/client";

export const deactivateUser = (payload: DeactivateUserActionType) => {
  return bffClient.patch(
    `/users/${payload?.user_uuid}/deactivate`,
    null,
    {
      headers: {
        org_uuid: payload?.org_uuid,
      },
    }
  );
};