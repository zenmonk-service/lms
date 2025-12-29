export const getUserTodayAttendanceType = "attendances/getUserTodayAttendance";
export const getUserAttendanceType = "attendances/getUserAttendance";
export const checkInType = "attendances/checkIn";
export const checkOutType = "attendances/checkOut";



interface Attendance {
  uuid: string;
  check_in: string;
  date : string
  check_out: string ;
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
}

export type { Attendance };