import { ActivateLeaveTypePayload } from "./activate-leave-type.types";
import { bffClient } from "@/config/client";

export const activateLeaveType = (payload: ActivateLeaveTypePayload) => {
  const { org_uuid, leave_type_uuid } = payload;
  return bffClient.patch(
    `/leave-types/${leave_type_uuid}/activate`,
    {},
    {
      headers: {
        org_uuid,
      },
    },
  );
};
