export interface RecommendLeaveRequestPayload {
  org_uuid: string;
  leave_request_uuid: string;
  manager_uuid: string;
  status_changed_to: string;
  remark?: string;
}
