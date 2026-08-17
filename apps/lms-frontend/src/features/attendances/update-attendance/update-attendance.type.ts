interface UpdateAttendancePayload {
  uuid: string;
  org_uuid: string;
  status: string;
  check_in?: string|null;
  check_out?: string|null;
  remarks?: string|null;
  range?: string;
  type?: string;
  leave_type_uuid?: string;
}