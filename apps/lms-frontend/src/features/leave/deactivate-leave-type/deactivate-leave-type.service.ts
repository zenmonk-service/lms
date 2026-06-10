import axiosInterceptorInstance from "@/config/axios";
import { DeactivateLeaveTypePayload } from "./deactivate-leave-type.types";

export const deactivateLeaveType = (payload: DeactivateLeaveTypePayload) => {
  const { org_uuid, leave_type_uuid } = payload;
  return axiosInterceptorInstance.patch(
    `/organizations/leave-types/${leave_type_uuid}/deactivate`,
    {},
    {
      headers: {
        org_uuid,
      },
    },
  );
};
