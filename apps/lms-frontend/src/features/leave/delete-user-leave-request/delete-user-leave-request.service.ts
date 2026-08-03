import { DeleteUserLeaveRequestPayload } from "./delete-user-leave-request.types";
import { bffClient } from "@/config/client";

export const deleteUserLeaveRequest = (payload: DeleteUserLeaveRequestPayload) => {
  const { org_uuid, user_uuid, leave_request_uuid } = payload;
  return bffClient.delete(
    `/users/${user_uuid}/leave-requests/${leave_request_uuid}`,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
