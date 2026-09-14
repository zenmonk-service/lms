import { bffClient } from "@/config/client";
import { ResolveLeaveBalanceDeficitPayload } from "./resolve-leave-balance-deficit.types";

export const resolveLeaveBalanceDeficit = (
  payload: ResolveLeaveBalanceDeficitPayload,
) => {
  const { org_uuid, user_uuid, ...data } = payload;

  return bffClient.put(`/leave-types/users/${user_uuid}/balances`, data, {
    headers: { org_uuid },
  });
};
