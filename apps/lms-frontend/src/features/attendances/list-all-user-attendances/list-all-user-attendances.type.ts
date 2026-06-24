export interface ListAllUserAttendancesPayload {
  org_uuid: string;
  search: string;
  date: string;
  page: number;
  limit: number;
  status: string;
}
