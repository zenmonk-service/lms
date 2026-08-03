import { GeneratePayrollPayload } from "./generate-payroll.types";
import { bffClient } from "@/config/client";

export const generatePayroll = (payload: GeneratePayrollPayload) => {
  const { org_uuid, payroll_id, params } = payload;
  return bffClient.post("/payrolls", { payroll_id, ...params }, {
    headers: { org_uuid },
  });
};
