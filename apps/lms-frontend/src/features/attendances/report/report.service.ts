import axiosInterceptorInstance from "@/config/axios";
import { GetAttendanceReportPayload } from "./report.type";

export const getAttendanceReport = ({
  org_uuid,
  search,
  page ,
  limit
}: GetAttendanceReportPayload) => {
  return axiosInterceptorInstance.get(`/organizations/attendances/report`, {
    headers: {
      org_uuid,
    },
    params: {
      search,
      page,
      limit
    }
  });
};
