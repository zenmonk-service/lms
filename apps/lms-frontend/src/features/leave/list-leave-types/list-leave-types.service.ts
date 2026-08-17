import { ListLeaveTypesPayload } from "./list-leave-types.types";
import { bffClient } from "@/config/client";

export const listLeaveTypes = (payload: ListLeaveTypesPayload) => {
  const { org_uuid, params } = payload;
  return bffClient.get(`/leave-types`, {
    headers: { org_uuid },
    params,
  });
};
