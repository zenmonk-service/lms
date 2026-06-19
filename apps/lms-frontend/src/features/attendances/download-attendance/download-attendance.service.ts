import axiosInterceptorInstance from "@/config/axios";
import { DownloadAttendanceReportPayload } from "./download-attendance.type";

export const downloadAttendanceReport = ({
  org_uuid,
  search,
  page,
  limit,
  date,
  status,
  month_filter,
}: DownloadAttendanceReportPayload) => {
  return axiosInterceptorInstance.get(`/organizations/attendances/download`, {
    headers: {
      org_uuid,
    },
    params: {
      search,
      page,
      limit,
      date,
      status,
      month_filter,
    },
  });
};
