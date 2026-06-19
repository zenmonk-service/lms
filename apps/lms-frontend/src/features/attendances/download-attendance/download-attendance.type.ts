export interface DownloadAttendanceReportPayload {
  org_uuid: string;
  search?: string;
  page?: number;
  limit?: number;
  date?: string;
  status?: string;
  month_filter?: string;
}
