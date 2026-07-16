import axiosInterceptorInstance from "@/config/axios";
import { ListLeaveRequestsPayload } from "./list-leave-requests.types";

export const listLeaveRequests = (payload: ListLeaveRequestsPayload) => {
  const { org_uuid, params } = payload;
  const { isInfiniteScroll, ...restParams } = params || {};
  return axiosInterceptorInstance.get(`/leave-requests`, {
    params: restParams,
    headers: { org_uuid },
  });
};
