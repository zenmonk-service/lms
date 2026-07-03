import axiosInterceptorInstance from "@/config/axios";
import { GetAttendanceReportPayload } from "./report.type";

export const getAttendanceReport = ({
  org_uuid,
  search,
  page,
  limit,
  date,
  status,
  month,
}: GetAttendanceReportPayload) => {
  return axiosInterceptorInstance.get(`/attendances/report`, {
    headers: {
      org_uuid,
    },
    params: {
      search,
      page,
      limit,
      date,
      status,
      month,
    },
  });
};
