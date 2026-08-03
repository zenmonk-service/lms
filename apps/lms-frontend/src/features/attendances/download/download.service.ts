import { bffClient } from "@/config/client";
import { DownloadAttendancePayload } from "./download.types";

export const downloadAttendanceReportService = async ({
  org_uuid,
  status,
  search,
  date_range,
  date,
  type,
}: DownloadAttendancePayload) => {
  const response = await bffClient.get(`/attendances/download`, {
    params: { status, search, date_range, date, type },
    headers: {
      org_uuid,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download attendance report");
  }

  const disposition = response.headers.get("content-disposition");

  const fileName =
    disposition?.match(/filename\*?=(?:UTF-8'')?"?([^"]+)"?/)?.[1] ??
    "attendance-report.xlsx";

  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = decodeURIComponent(fileName);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
