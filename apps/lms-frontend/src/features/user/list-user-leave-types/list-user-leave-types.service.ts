import { ListUserLeaveTypesPayload } from "./list-user-leave-types.types";
import { bffClient } from "@/config/client";

export const listLeaveTypesService = (payload: ListUserLeaveTypesPayload) => {
  const { org_uuid, ...params } = payload;
  return bffClient.get(`/leave-types`, {
    headers: { org_uuid },
    params,
  });
};
