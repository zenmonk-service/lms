import { RejectLeaveRequestPayload } from "./reject-leave-request.types";
import { bffClient } from "@/config/client";

export const rejectLeaveRequest = (payload: RejectLeaveRequestPayload) => {
  const {
    org_uuid,
    leave_request_uuid,
    manager_uuid,
    status_changed_to,
    remark,
  } = payload;
  return bffClient.patch(
    `/leave-requests/${leave_request_uuid}/reject`,
    {
      manager_uuid: manager_uuid,
      remark,
      status_changed_to,
    },
    {
      headers: {
        org_uuid,
      },
    },
  );
};
