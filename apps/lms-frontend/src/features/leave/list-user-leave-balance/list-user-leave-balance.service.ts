import axiosInterceptorInstance from "@/config/axios";
import { ListUserLeaveBalancePayload } from "./list-user-leave-balance.types";

export const listUserLeaveBalances = (payload: ListUserLeaveBalancePayload) => {
  const { org_uuid, user_uuid, period } = payload;
  return axiosInterceptorInstance.get(
    `/organizations/leave-types/users/${user_uuid}/balances`,
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
