import { AttendanceStatus } from "../attendances.type";

export interface GetUserAttendancesPayload {
  org_uuid: string;
  params: {
    page?: number;
    date?: string;
    limit?: number;
    user_uuid?: string;
    status?: AttendanceStatus;
    user_name_search?: string;
    date_range?: { start_date?: string; end_date?: string };
  }
}
