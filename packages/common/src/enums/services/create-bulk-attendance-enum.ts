import { ENUM } from "../enum";

export class CreateBulkAttendance extends ENUM {
  static ENUM = {
    MANUAL_UPLOAD: "manual_upload",
    EXCEL_UPLOAD: "excel_upload",
  } as const;
}

export type CreateBulkAttendanceType =
  (typeof CreateBulkAttendance.ENUM)[keyof typeof CreateBulkAttendance.ENUM];
