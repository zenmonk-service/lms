import axiosInterceptorInstance from "@/config/axios";
import { DownloadAttendancePayload } from "./download.types";

export const downloadAttendanceReportService = async ({
  org_uuid,
  status,
  search,
  date_range,
  date,
}: DownloadAttendancePayload) => {
  const response = await axiosInterceptorInstance.get("/attendances/download", {
    params: {
      status,
      search,
      date_range,
      date,
    },
    headers: {
      org_uuid,
    },
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"];

  const fileName =
    disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? "attendance-report.xlsx";

  const url = URL.createObjectURL(response.data);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};
