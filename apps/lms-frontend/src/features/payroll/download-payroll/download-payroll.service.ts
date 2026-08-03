import { DownloadPayrollPayload } from "./download-payroll.types";
import { bffClient } from "@/config/client";

export const downloadPayroll = (payload: DownloadPayrollPayload) => {
  const { org_uuid, period } = payload;
  return bffClient.get(`/payrolls/download`, {
    headers: { org_uuid },
    params: { period },
  });
};
