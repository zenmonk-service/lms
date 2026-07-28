import axiosInterceptorInstance from "@/config/axios";
import { GeneratePayrollPayload } from "./generate-payroll.types";

export const generatePayroll = (payload: GeneratePayrollPayload) => {
  const { org_uuid, payroll_id, params } = payload;
  return axiosInterceptorInstance.post("/payrolls", { payroll_id, ...params }, {
    headers: { org_uuid },
  });
};
