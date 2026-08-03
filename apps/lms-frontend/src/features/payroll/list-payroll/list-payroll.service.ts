import { ListPayrollPayload } from "./list-payroll.types";
import { bffClient } from "@/config/client";

export const listPayroll = (payload: ListPayrollPayload) => {
  const { org_uuid, params } = payload;
  return bffClient.get(`/payrolls`, {
    headers: { org_uuid },
    params,
  });
};
