import { GetUserLeaveRequestPayload } from "./get-user-leave-request.types";
import { bffClient } from "@/config/client";

export const getUserLeaveRequest = (payload: GetUserLeaveRequestPayload) => {
  const { org_uuid, user_uuid, leave_request_uuid } = payload;
  return bffClient.get(
    `/users/${user_uuid}/leave-requests/${leave_request_uuid}`,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
