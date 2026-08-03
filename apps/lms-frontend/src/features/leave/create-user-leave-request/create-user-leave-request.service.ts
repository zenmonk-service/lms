import { CreateLeaveRequestPayload } from "./create-user-leave-request.types";
import { bffClient } from "@/config/client";

export const createUserLeaveRequests = (payload: CreateLeaveRequestPayload) => {
  const { org_uuid, user_uuid, ...data } = payload;
  return bffClient.post(
    `/users/${user_uuid}/leave-requests`,
    data,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
