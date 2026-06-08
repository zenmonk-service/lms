import axiosInterceptorInstance from "@/config/axios";
import { RejectLeaveRequestPayload } from "./reject-leave-request.types";

export const rejectLeaveRequest = (payload: RejectLeaveRequestPayload) => {
  const {
    org_uuid,
    leave_request_uuid,
    manager_uuid,
    status_changed_to,
    remark,
  } = payload;
  return axiosInterceptorInstance.patch(
    `/organizations/leave-requests/${leave_request_uuid}/reject`,
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
