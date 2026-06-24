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
  LATE = "late",
  EARLY_DEPARTURE = "early_departure",
  HALF_DAY = "half_day",
  WEEK_OFF = "week_off",
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
  user_id: string;
  name: string;
  image?: string;
  email?: string;
  attendances: Attendance[];
}

export interface MonthlySummary {
  month: string;
  present_count: number;
  absent_count: number;
  on_leave_count: number;
  late_count: number;
}

export interface TodayAttendance {
  date: string;
  present_count: string;
  absent_count: string;
  on_leave_count: string;
  holiday_count: string;
  late_count: string;
}

export interface AttendanceReport {
  user_attendance_report: { rows: AttendanceReportRow[]; count: number , total : number};
  daily_attendance_report: TodayAttendance;
  monthly_attendance_report: MonthlySummary[];
}
export interface AttendanceState {
  attendance: Attendance;
  error: string | null | unknown;
  loading: boolean;
  attendances: AttendanceList;
  report: AttendanceReport| null;
}

export enum AttendanceActionType {
  GET_USER_TODAY_ATTENDANCE = "attendances/getUserTodayAttendance",
  GET_USER_ATTENDANCE = "attendances/getUserAttendance",
  LIST_ALL_USER_ATTENDANCE = "attendances/listAllUserAttendance",
  CHECK_IN = "attendances/checkIn",
  CHECK_OUT = "attendances/checkOut",
  GET_ATTENDANCE_REPORT = "attendances/downloadAttendanceReport",
  UPLOAD_ATTENDANCE_REPORT = "attendances/uploadAttendanceReport",
}
