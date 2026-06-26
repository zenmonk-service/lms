interface CreateAttendancePayload {
  org_uuid: string;
  user_uuid: string;
  status: string;
  check_in?: string;
  check_out?: string;
  date?: string;
}