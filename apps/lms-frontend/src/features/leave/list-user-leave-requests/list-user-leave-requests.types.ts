import { LeaveRequestFilter } from "../leave.types";

export interface ListUserLeaveRequestsPayload {
  org_uuid: string;
  user_uuid: string;
  params?: {
    page?: number;
    limit?: number;
    search?: string;
  } & LeaveRequestFilter;
}
