export interface GetAttendanceReportPayload {
  org_uuid: string;
  search?: string;
  page?: number;
  limit?: number;
}