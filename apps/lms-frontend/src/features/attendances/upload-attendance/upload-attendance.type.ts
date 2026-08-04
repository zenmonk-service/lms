import { AttendanceStatus } from "../attendances.type";

interface AttendanceExcelUpload {
  emp_code: string;
  check_in: string | null;
  check_out: string | null;
}

export interface UploadAttendancePayload {
  date: string;
  org_uuid: string;
  type: UploadType;
  attendances?: AttendanceExcelUpload[];
  status?: AttendanceStatus;
  remarks?: string;
}

export enum UploadType {
  EXCEL_UPLOAD = "excel_upload",
  MANUAL_UPLOAD = "manual_upload",
}
