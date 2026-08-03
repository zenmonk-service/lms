import { GetAttendanceReportPayload } from "./report.type";
import { bffClient } from "@/config/client";

export const getAttendanceReport = ({
  org_uuid,
  search,
  page,
  limit,
  date,
  status,
  month,
}: GetAttendanceReportPayload) => {
  return bffClient.get(`/attendances/report`, {
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
