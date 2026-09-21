interface GetUserLeaveTypeReportPayload {
  org_uuid: string;
  pagination: {
    page: number;
    limit: number;
    search?: string;
  };
  is_active?: boolean;
  month?: string;
}