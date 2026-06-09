import axiosInterceptorInstance from "@/config/axios";
import { ActivateLeaveTypePayload } from "./activate-leave-type.types";

export const activateLeaveType = (payload: ActivateLeaveTypePayload) => {
  const { org_uuid, leave_type_uuid } = payload;
  return axiosInterceptorInstance.patch(
    `/organizations/leave-types/${leave_type_uuid}/activate`,
    {
      headers: {
        org_uuid,
      },
    },
  );
};
