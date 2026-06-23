import axiosInterceptorInstance from "@/config/axios";
import { ListUserLeaveRequestsPayload } from "./list-user-leave-requests.types";

export const listUserLeaveRequests = (
  payload: ListUserLeaveRequestsPayload,
) => {
  const { user_uuid, org_uuid } = payload;
  const { pagination, ...filters } = payload.params || {};

  const params = {
    ...filters,
    ...pagination,
  };

  return axiosInterceptorInstance.get(`/users/${user_uuid}/leave-requests`, {
    params,
    headers: { org_uuid },
  });
};
