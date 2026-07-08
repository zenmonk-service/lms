import { AttendanceStatus } from "../attendances.type";

export interface CreateMissingAttendancesPayload {
  org_uuid: string;
  records: {
    date: string;
    status: AttendanceStatus;
  }[];
}
