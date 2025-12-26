export const getUserAttendanceType = "attendances/getUserAttendance";



interface Attendance {
  uuid: string;
  check_in_time: string;
  check_out_time: string | null;
  status: AttendanceStatus;
  created_at: string;
  updated_at: string;
}


enum AttendanceStatus {
  PRESENT = "present",
  ABSENT = "absent",
  ON_LEAVE = "on_leave",
}

export type { Attendance, AttendanceStatus };