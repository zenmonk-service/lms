import { ApproveLeaveRequestPayload } from "./approve-leave-request.types";
import { bffClient } from "@/config/client";

export const approveLeaveRequest = (payload: ApproveLeaveRequestPayload) => {
  const {
    org_uuid,
    leave_request_uuid,
    manager_uuid,
    status_changed_to,
    user_uuid,
    remark,
  } = payload;

  return bffClient.patch(
    `/leave-requests/${leave_request_uuid}/approve`,
    {
      manager_uuid,
      remark,
      status_changed_to,
      user_uuid,
    },
    {
      headers: {
        org_uuid,
      },
    },
  );
};
