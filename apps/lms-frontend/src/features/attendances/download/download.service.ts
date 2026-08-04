import { bffClient } from "@/config/client";
import { DownloadAttendancePayload } from "./download.types";
import { downloadExcelService } from "@/features/download-excel/download-excel.service";

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

  downloadExcelService({response})
};
