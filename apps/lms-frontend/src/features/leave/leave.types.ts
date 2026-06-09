import { LeaveType } from "../leave-types/leave-types.slice";

export enum LeaveRange {
  FULL_DAY = "full_day",
  FIRST_HALF = "first_half",
  SECOND_HALF = "second_half",
  FIRST_QUARTER = "first_quarter",
  SECOND_QUARTER = "second_quarter",
  THIRD_QUARTER = "third_quarter",
  FOURTH_QUARTER = "fourth_quarter",
}

export enum LeaveRequestType {
  FULL_DAY = "full_day",
  HALF_DAY = "half_day",
  SHORT_LEAVE = "short_leave",
}

export enum LeaveRequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  CANCELLED = "Cancelled",
  RECOMMENDED = "Recommended",
}

export interface LeaveRequest {
  count: number;
  current_page: number;
  total: number;
  rows: Row[];
}

export interface Managers {
  remarks: string;
  status_changed_to: LeaveRequestStatus | null;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: {
      name: string;
      uuid: string;
    };
  };
}

export interface Row {
  uuid: string;
  start_date: string;
  end_date: string;
  type: string;
  range: string;
  leave_duration: string;
  reason: string;
  status: LeaveRequestStatus;
  leave_type: {
    name: string;
    uuid: string;
  };
  managers: Managers[];
  effective_days: string;
}

export interface LeaveBalance {
  balance: string;
  leaves_allocated: number;
  period: string;
  leave_type: LeaveType;
}

export interface SelectedLeave {
  uuid: string;
  status_changed_by: [{ user_id: string }] | null;
  leave_type: {
    name: string;
    uuid: string;
    leave_balances: LeaveBalance[];
  };
  leave_duration: number;
  managers: Managers[];
  reason: string | null;
  status: LeaveRequestStatus;
  type: string;
  range: string;
  start_date: string;
  end_date: string;
  created_at: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: {
      name: string;
      uuid: string;
    };
  };
}

export interface LeaveRequestFilter {
  pagination?: {
    page: number;
    limit: number;
    search?: string;
  };
  status?: LeaveRequestStatus;
  date_range?: [string, string];
  date?: string;
  leave_type_uuid?: string;
  managers?: string[];
  user_uuid?: string;
}

export interface LeaveState {
  isLoading: boolean;
  isLoadingMore: boolean;
  userLeaveRequests: LeaveRequest;
  leaveRequests: LeaveRequest;
  selectedLeaveRequestDetails?: {
    leave_uuid?: string;
    user?: {
      user_id: string;
      name: string;
      email: string;
      role: {
        name: string;
      };
      phone_number: string;
    };
  };
  selectedLeaveRequest?: SelectedLeave;
  isSelectedLeaveRequestLoading: boolean;
  leaveRequestFilter?: LeaveRequestFilter;
}
