export interface GetUserAttendancesPayload {
  org_uuid: string;
  user_name_search?: string;
  status?: string;
  user_uuid?: string;
  date_range?: unknown;
  page?: number;
  limit?: number;
  date?: string;
}
