import axiosInterceptorInstance from "@/config/axios";
import { DownloadPayrollPayload } from "./download-payroll.types";

export const downloadPayroll = (payload: DownloadPayrollPayload) => {
  const { org_uuid, period } = payload;
  return axiosInterceptorInstance.get(`/payrolls/download`, {
    headers: { org_uuid },
    params: { period },
    responseType: "arraybuffer",
  });
};
