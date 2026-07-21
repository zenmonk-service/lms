export enum DownloadAttendanceType {
 DAILY_ATTENDANCE= "daily_attendance",
 MONTHLY_ATTENDANCE= "monthly_attendance",
 DAILY_ATTENDANCE_ANALYTICS= "daily_attendance_analytics",
 MONTHLY_ATTENDANCE_ANALYTICS= "monthly_attendance_analytics",
}
export interface DownloadAttendancePayload {
  date?: string;
  date_range?: {
    start_date?: string;
    end_date?: string;
  };
  org_uuid: string;
  status?: string;
  search?: string;
  type : DownloadAttendanceType;
}
