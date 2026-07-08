import axiosInterceptorInstance from "@/config/axios";
import { GeneratePayrollPayload } from "./generate-payroll.types";

export const generatePayroll = (payload: GeneratePayrollPayload) => {
  const { org_uuid, params } = payload;
  return axiosInterceptorInstance.post(`/payrolls`, { ...params }, {
    headers: { org_uuid },
  });
};
