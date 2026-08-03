import { DeactivateLeaveTypePayload } from "./deactivate-leave-type.types";
import { bffClient } from "@/config/client";

export const deactivateLeaveType = (payload: DeactivateLeaveTypePayload) => {
  const { org_uuid, leave_type_uuid } = payload;
  return bffClient.patch(
    `/leave-types/${leave_type_uuid}/deactivate`,
    {},
    {
      headers: {
        org_uuid,
      },
    },
  );
};
