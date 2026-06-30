import axiosInterceptorInstance from "@/config/axios";
import { ListPayrollPayload } from "./list-payroll.types";

export const listPayroll = (payload: ListPayrollPayload) => {
  const { org_uuid, params } = payload;
  return axiosInterceptorInstance.get(`/payrolls`, {
    headers: { org_uuid },
    params,
  });
};
