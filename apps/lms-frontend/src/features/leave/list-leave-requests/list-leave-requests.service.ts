import { ListLeaveRequestsPayload } from "./list-leave-requests.types";
import { bffClient } from "@/config/client";

export const listLeaveRequests = (payload: ListLeaveRequestsPayload) => {
  const { org_uuid, params } = payload;
  const { isInfiniteScroll, ...restParams } = params || {};
  return bffClient.get(`/leave-requests`, {
    params: restParams,
    headers: { org_uuid },
  });
};
