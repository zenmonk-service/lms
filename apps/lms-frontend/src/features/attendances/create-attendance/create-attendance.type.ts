interface CreateAttendancePayload {
  org_uuid: string;
  user_uuid: string;
  status: string;
  check_in?: string|null;
  check_out?: string|null;
  date?: string;
}