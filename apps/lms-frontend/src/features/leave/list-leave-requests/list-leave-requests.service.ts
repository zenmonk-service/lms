import axiosInterceptorInstance from "@/config/axios";
import { ListLeaveRequestsPayload } from "./list-leave-requests.types";

export const listLeaveRequests = (payload: ListLeaveRequestsPayload) => {
  const { org_uuid, params } = payload;
  return axiosInterceptorInstance.get(`/organizations/leave-requests`, {
    params,
    headers: {
      org_uuid,
    },
  });
};
