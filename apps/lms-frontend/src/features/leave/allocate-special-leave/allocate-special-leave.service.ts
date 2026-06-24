import axiosInterceptorInstance from "@/config/axios";
import { AllocateSpecialLeave } from "./allocate-special-leave.type";

export const allocateSpecialLeave = (payload: AllocateSpecialLeave) => {
  const { org_uuid, leave_balance_uuid, sla } = payload;

  return axiosInterceptorInstance.put(
    `/organizations/leave-balances/${leave_balance_uuid}/sla`,
    { sla },
    {
      headers: {
        org_uuid,
      },
    },
  );
};
