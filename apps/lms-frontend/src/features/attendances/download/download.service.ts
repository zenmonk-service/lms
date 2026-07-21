import axiosInterceptorInstance from "@/config/axios";
import { DownloadAttendancePayload } from "./download.types";

export const downloadAttendanceReportService = async ({
  org_uuid,
  status,
  search,
  date_range,
  date,
  type,
}: DownloadAttendancePayload) => {
  const response = await axiosInterceptorInstance.get("/attendances/download", {
    params: {
      status,
      search,
      date_range,
      date,
      type,
    },
    headers: {
      org_uuid,
    },
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"];

  const fileName =
    disposition?.match(/filename\*?=(?:UTF-8'')?"?([^"]+)"?/)?.[1] ??
    "attendance-report.xlsx";

  const blob =
    response.data instanceof Blob
      ? response.data
      : new Blob([response.data], {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = decodeURIComponent(fileName);

  document.body.appendChild(link);
  link.click();

  link.remove();
  window.URL.revokeObjectURL(url);
};