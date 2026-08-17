interface UpdateAttendancePayload {
  uuid: string;
  org_uuid: string;
  status: string;
  check_in?: string|null;
  check_out?: string|null;
  remarks?: string|null;
  range?: string;
  leave_type_uuid?: string;
}