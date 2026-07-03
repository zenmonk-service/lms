interface UpdateAttendancePayload {
  uuid: string;
  org_uuid: string;
  status: string;
  check_in?: string;
  check_out?: string;
}