import { GetLeaveBalancePayload } from "./get-leave-balance.types";
import { bffClient } from "@/config/client";

export const getLeaveBalance = (payload: GetLeaveBalancePayload) => {
  const { org_uuid, leave_type_uuid, user_uuid, period } = payload;
  return bffClient.get(`/leave-types/${leave_type_uuid}/balance`, {
    params: {
      user_uuid,
      period,
    },
    headers: {
      org_uuid,
    },
  });
};
