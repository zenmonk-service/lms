export const getUserTodayAttendanceType = "attendances/getUserTodayAttendance";
export const getUserAttendanceType = "attendances/getUserAttendance";
export const checkInType = "attendances/checkIn";
export const checkOutType = "attendances/checkOut";

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
  type: string | null;
  location: string | null;
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

export interface AttendanceState {
  attendance: Attendance;
  error: string | null | unknown;
  loading: boolean;
  attendances: AttendanceList;
}
