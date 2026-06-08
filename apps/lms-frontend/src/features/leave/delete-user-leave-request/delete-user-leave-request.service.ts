import axiosInterceptorInstance from "@/config/axios";
import { DeleteUserLeaveRequestPayload } from "./delete-user-leave-request.types";

export const deleteUserLeaveRequest = (payload: DeleteUserLeaveRequestPayload) => {
  const { org_uuid, user_uuid, leave_request_uuid } = payload;
  return axiosInterceptorInstance.delete(
    `/users/${user_uuid}/leave-requests/${leave_request_uuid}`,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
