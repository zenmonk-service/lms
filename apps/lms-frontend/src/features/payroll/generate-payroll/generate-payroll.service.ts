import axiosInterceptorInstance from "@/config/axios";
import { GeneratePayrollPayload } from "./generate-payroll.types";

export const generatePayroll = (payload: GeneratePayrollPayload) => {
  const { org_uuid, ...body } = payload;
  return axiosInterceptorInstance.post(`/payrolls`, body, {
    headers: { org_uuid },
  });
};
