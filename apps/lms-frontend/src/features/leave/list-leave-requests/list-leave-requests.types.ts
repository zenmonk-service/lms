import { LeaveRequestFilter } from "../leave.types";

export interface ListLeaveRequestsPayload {
  org_uuid: string;
  params?: {
    user_uuid?: string;
    manager_uuid?: string;
    page?: number;
    limit?: number;
    search?: string;
    isInfiniteScroll?: boolean;
  } & Omit<LeaveRequestFilter, "status"> & {
    status?: string;
  };
}
