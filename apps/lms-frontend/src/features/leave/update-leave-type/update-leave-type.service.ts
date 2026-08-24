import { bffClient } from "@/config/client";
import { UpdateLeaveTypePayload } from "./update-leave-type.types";

export const updateLeaveType = (payload: UpdateLeaveTypePayload) => {
  const { org_uuid, uuid, ...data } = payload;

  return bffClient.put(`/leave-types/${uuid}`, data, {
    headers: { org_uuid: org_uuid! },
  });
};
