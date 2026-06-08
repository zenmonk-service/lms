import axiosInterceptorInstance from "@/config/axios";
import { RecommendLeaveRequestPayload } from "./recommend-leave-request.types";

export const recommendLeaveRequest = (
  payload: RecommendLeaveRequestPayload,
) => {
  const {
    org_uuid,
    leave_request_uuid,
    manager_uuid,
    status_changed_to,
    remark,
  } = payload;
  return axiosInterceptorInstance.patch(
    `/organizations/leave-requests/${leave_request_uuid}/recommend`,
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
