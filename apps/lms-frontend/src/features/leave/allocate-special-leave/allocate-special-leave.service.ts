import { AllocateSpecialLeave } from "./allocate-special-leave.type";
import { bffClient } from "@/config/client";

export const allocateSpecialLeave = (payload: AllocateSpecialLeave) => {
  const { org_uuid, leave_type_uuid, ...rest } = payload;

  return bffClient.put(
    `/leave-types/${leave_type_uuid}/sla`,
    { ...rest },
    {
      headers: {
        org_uuid,
      },
    },
  );
};
