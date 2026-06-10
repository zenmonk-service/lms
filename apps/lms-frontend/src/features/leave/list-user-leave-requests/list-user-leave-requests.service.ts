import axiosInterceptorInstance from "@/config/axios";
import { ListUserLeaveRequestsPayload } from "./list-user-leave-requests.types";

export const listUserLeaveRequests = (
  payload: ListUserLeaveRequestsPayload,
) => {
  const { user_uuid, org_uuid } = payload;
  const { pagination, ...filters } = payload.params || {};

  return axiosInterceptorInstance.get(`/users/${user_uuid}/leave-requests`, {
    ...filters,
    ...pagination,
    headers: { org_uuid },
  });
};
