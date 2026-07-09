export interface DownloadAttendancePayload {
  date?: string;
  date_range?: {
    start_date?: string;
    end_date?: string;
  };
  org_uuid: string;
  status?: string;
  search?: string;
}
