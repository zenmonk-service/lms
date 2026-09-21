import { ENUM } from "../enum";

// Supersedes the frontend's DownloadAttendanceType (attendances/download/
// download.types.ts), which only has a 4-value subset of this enum
// (missing MONTHLY_PAYROLL).
export class DownloadExcel extends ENUM {
  static ENUM = {
    DAILY_ATTENDANCE: "daily_attendance",
    MONTHLY_ATTENDANCE: "monthly_attendance",
    DAILY_ATTENDANCE_ANALYTICS: "daily_attendance_analytics",
    MONTHLY_ATTENDANCE_ANALYTICS: "monthly_attendance_analytics",
    MONTHLY_PAYROLL: "monthly_payroll",
  } as const;
}

export type DownloadExcelType = (typeof DownloadExcel.ENUM)[keyof typeof DownloadExcel.ENUM];
