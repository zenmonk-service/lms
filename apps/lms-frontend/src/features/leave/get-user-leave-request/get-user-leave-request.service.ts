import axiosInterceptorInstance from "@/config/axios";
import { GetUserLeaveRequestPayload } from "./get-user-leave-request.types";

export const getUserLeaveRequest = (payload: GetUserLeaveRequestPayload) => {
  const { org_uuid, user_uuid, leave_request_uuid } = payload;
  return axiosInterceptorInstance.get(
    `/users/${user_uuid}/leave-requests/${leave_request_uuid}`,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
