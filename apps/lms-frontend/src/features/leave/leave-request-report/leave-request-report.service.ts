import { GetLeaveRequestsReportPayload } from "./leave-request-report.type";
import { bffClient } from "@/config/client";

export const getLeaveRequestsReport = (payload: GetLeaveRequestsReportPayload) => {
  const { org_uuid, params } = payload;
  return bffClient.get(`/leave-requests/report`, {
    params,
    headers: {
      org_uuid,
    },
  });
};
