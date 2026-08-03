import { CreateLeaveTypePayload } from "./create-leave-type.types";
import { bffClient } from "@/config/client";

export const createLeaveType = (payload: CreateLeaveTypePayload) => {
  const { org_uuid, ...data } = payload;

  return bffClient.post(`/leave-types`, data, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};
