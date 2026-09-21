import { ENUM } from "../enum";

export class AttendanceReportType extends ENUM {
  static ENUM = {
    USER_ATTENDANCE: "user_attendance",
    MONTHLY_ATTENDANCE: "monthly_attendance",
    DAILY_ATTENDANCE: "daily_attendance",
  } as const;
}

export type AttendanceReportTypeType =
  (typeof AttendanceReportType.ENUM)[keyof typeof AttendanceReportType.ENUM];
