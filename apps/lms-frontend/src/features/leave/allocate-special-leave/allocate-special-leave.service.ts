import { AllocateSpecialLeave } from "./allocate-special-leave.type";
import { bffClient } from "@/config/client";

export const allocateSpecialLeave = (payload: AllocateSpecialLeave) => {
  const { org_uuid, leave_balance_uuid, sla } = payload;

  return bffClient.put(
    `/leave-balances/${leave_balance_uuid}/sla`,
    { sla },
    {
      headers: {
        org_uuid,
      },
    },
  );
};
