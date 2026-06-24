export interface GetUserAttendancesPayload {
  org_uuid: string;
  user_uuid: string;
  date_range?: unknown;
  page?: number;
  limit?: number;
}
