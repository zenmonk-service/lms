export interface ApproveLeaveRequestPayload {
  org_uuid: string;
  leave_request_uuid: string;
  manager_uuid: string;
  status_changed_to: string;
  user_uuid: string;
  remark?: string;
}