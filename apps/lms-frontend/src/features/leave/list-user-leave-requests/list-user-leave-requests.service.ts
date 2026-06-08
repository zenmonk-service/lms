import axiosInterceptorInstance from "@/config/axios";
import { LeaveRequestFilter } from "../leave.types";

export const listUserLeaveRequests = (
  org_uuid: string,
  user_uuid: string,
  params?: LeaveRequestFilter,
) => {
  return axiosInterceptorInstance.get(`/users/${user_uuid}/leave-requests`, {
    params,
    headers: {
      org_uuid,
    },
  });
};
