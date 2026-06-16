export interface Attendance {
  uuid: string;
  check_in: string;
  date: string;
  check_out: string;
  status: AttendanceStatus;
  attendance_log: AttendanceLog[];
  affected_hours: string;
}

interface AttendanceLog {
  time: string;
  type: string;
  location: string;
}

export enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  ON_LEAVE = "on_leave",
  HOLIDAY = "holiday",
  ON_DUTY = "on_duty",
}

export interface AttendanceList {
  rows: Attendance[];
  current_page?: number;
  total?: number;
  per_page?: number;
  total_present_current_month: number;
  total_absent_current_month: number;
}

export interface AttendanceReportRow {
  user_uuid: string;
  name: string;
  attendances: Attendance[];
}

export interface MonthlySummary {
  month: string;
  total_present: number;
  total_absent: number;
  total_on_leave: number;
  total_holiday: number;
  total_on_duty: number;
}

export interface TodayAttendance {
  date: string;
  present: string;
  late: string;
  absent: string;
  on_leave: string;
  holiday: string;
}
export interface AttendanceState {
  attendance: Attendance;
  error: string | null | unknown;
  loading: boolean;
  attendances: AttendanceList;
  report: {
    attendance_report_rows: AttendanceReportRow[];
    today_attendance: TodayAttendance;
    monthly_summary: MonthlySummary;
  } | null;
}

export enum AttendanceActionType {
  GET_USER_TODAY_ATTENDANCE = "attendances/getUserTodayAttendance",
  GET_USER_ATTENDANCE = "attendances/getUserAttendance",
  CHECK_IN = "attendances/checkIn",
  CHECK_OUT = "attendances/checkOut",
  GET_ATTENDANCE_REPORT = "attendances/getAttendanceReport",
}
