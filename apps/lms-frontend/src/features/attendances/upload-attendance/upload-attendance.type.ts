
export interface UploadAttendancePayload {
  date: string;
  org_uuid: string;
  attendances: {
    emp_code: string;
    check_in: string | null;
    check_out: string | null;
  }[];
}
