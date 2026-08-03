import { UpdateUserLeaveRequestPayload } from "./update-user-leave-request.types";
import { bffClient } from "@/config/client";

export const updateLeaveRequest = (payload: UpdateUserLeaveRequestPayload) => {
  const { org_uuid, user_uuid, leave_request_uuid, ...data } = payload;
  return bffClient.put(
    `/users/${user_uuid}/leave-requests/${leave_request_uuid}`,
    data,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
