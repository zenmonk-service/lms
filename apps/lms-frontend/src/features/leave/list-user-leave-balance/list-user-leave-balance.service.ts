import { ListUserLeaveBalancePayload } from "./list-user-leave-balance.types";
import { bffClient } from "@/config/client";

export const listUserLeaveBalances = (payload: ListUserLeaveBalancePayload) => {
  const { org_uuid, user_uuid, period } = payload;
  return bffClient.get(
    `/leave-types/users/${user_uuid}/balances`,
    {
      params: {
        period,
      },
      headers: {
        org_uuid,
      },
    },
  );
};
