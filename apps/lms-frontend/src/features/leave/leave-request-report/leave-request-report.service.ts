import axiosInterceptorInstance from "@/config/axios";
import { GetLeaveRequestsReportPayload } from "./leave-request-report.type";

export const getLeaveRequestsReport = (payload: GetLeaveRequestsReportPayload) => {
  const { org_uuid, params } = payload;
  return axiosInterceptorInstance.get(`/leave-requests/report`, {
    params,
    headers: {
      org_uuid,
    },
  });
};
