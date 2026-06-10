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

export interface LeaveType {
  uuid: string;
  name: string;
  code: string;
  description: string;
  applicable_for: {
    type: string;
    value: { uuid?: string; user_id?: string; name: string }[];
  };
  max_consecutive_days: number | null;
  allow_negative_leaves: boolean;
  is_sandwich_enabled: boolean;
  is_clubbing_enabled: boolean;
  accrual: {
    period: string;
    leave_count: number;
    applicable_on: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface LeaveTypes {
  count: number;
  rows: LeaveType[];
  current_page: number;
  per_page: number;
  total: number;
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
  uuid?: string;
  balance: string;
  leaves_allocated: number;
  period: string;
  sla:string;
  final_balance: number;
  leave_type: LeaveType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
  leaveTypesLoading: boolean;
  leaveRequestsLoading: boolean;
  leaveRequestsMoreLoading: boolean;
  userLeaveRequestsLoading: boolean;
  userLeaveRequestsMoreLoading: boolean;
  leaveBalancesLoading: boolean;

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
  userLeaveBalances: LeaveBalance[];
  leaveTypes: LeaveTypes;
}
