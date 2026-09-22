import {
  LeaveApplicableOn as CommonLeaveApplicableOn,
  LeaveRange as CommonLeaveRange,
  LeaveRequestType as CommonLeaveRequestType,
  LeaveRequestStatus as CommonLeaveRequestStatus,
  TimePeriod as CommonTimePeriod,
  LeaveBalanceLogSource as CommonLeaveBalanceLogSource,
} from "@repo/common";
import { Role } from "../role/role.type";
import { UserInterface } from "../user/user.type";

export const LeaveApplicableOn = CommonLeaveApplicableOn.ENUM;
export type LeaveApplicableOn =
  (typeof CommonLeaveApplicableOn.ENUM)[keyof typeof CommonLeaveApplicableOn.ENUM];

export const LeaveRange = CommonLeaveRange.ENUM;
export type LeaveRange =
  (typeof CommonLeaveRange.ENUM)[keyof typeof CommonLeaveRange.ENUM];

export const LeaveRequestType = CommonLeaveRequestType.ENUM;
export type LeaveRequestType =
  (typeof CommonLeaveRequestType.ENUM)[keyof typeof CommonLeaveRequestType.ENUM];

export const LeaveRequestStatus = CommonLeaveRequestStatus.ENUM;
export type LeaveRequestStatus =
  (typeof CommonLeaveRequestStatus.ENUM)[keyof typeof CommonLeaveRequestStatus.ENUM];

export enum LeaveActionType {
  LIST_LEAVE_REQUESTS = "leave/list-leave-requests",
  APPROVE_LEAVE_REQUEST = "leave/approve-leave-requests",
  REJECT_LEAVE_REQUEST = "leave/reject-leave-requests",
  RECOMMEND_LEAVE_REQUEST = "leave/recommend-leave-request",
  LIST_USER_LEAVE_REQUESTS = "leave/list-user-leave-requests",
  GET_USER_LEAVE_REQUEST = "leave/get-user-leave-request",
  CREATE_USER_LEAVE_REQUEST = "leave/create-user-leave-requests",
  UPDATE_USER_LEAVE_REQUEST = "leave/update-user-leave-requests",
  DELETE_USER_LEAVE_REQUEST = "leave/delete-user-leave-requests",
  GET_LEAVE_REQUESTS_REPORT = "leave/get-leave-requests-report",
  LIST_USER_LEAVE_BALANCES = "leave/list-user-leave-balances",
  GET_LEAVE_BALANCE = "leave/get-leave-balance",
  LIST_LEAVE_TYPES = "leave/list-leave-types",
  CREATE_LEAVE_TYPE = "leave/create-leave-type",
  UPDATE_LEAVE_TYPE = "leave/update-leave-type",
  ACTIVATE_LEAVE_TYPE = "leave/activate-leave-type",
  DEACTIVATE_LEAVE_TYPE = "leave/deactivate-leave-type",
  ALLOCATE_SPECIAL_LEAVE = "leave/allocate-special-leave",
  GET_REQUEST_EFFECTIVE_DAYS = "leave/get-request-effective-days",
  RESOLVE_LEAVE_BALANCE_DEFICIT = "leave/resolve-leave-balance-deficit",
  GET_USER_LEAVE_TYPE_REPORT = "leave/get-user-leave-type-report",
}

export const TimePeriod = CommonTimePeriod.ENUM;
export type TimePeriod =
  (typeof CommonTimePeriod.ENUM)[keyof typeof CommonTimePeriod.ENUM];

export const LeaveBalanceLogSource = CommonLeaveBalanceLogSource.ENUM;
export type LeaveBalanceLogSource =
  (typeof CommonLeaveBalanceLogSource.ENUM)[keyof typeof CommonLeaveBalanceLogSource.ENUM];
export interface LeaveType {
  uuid: string;
  name: string;
  code: string;
  description?: string;
  users: UserInterface[];
  roles: Role[];
  leave_balances: LeaveBalance[];
  max_consecutive_days: number | null;
  allow_negative_leaves: boolean;
  is_sandwich_enabled: boolean;
  is_clubbing_enabled: boolean;
  is_full_day_only?: boolean | null;
  min_tenure_months?: number | null;
  accrual: {
    period: TimePeriod;
    leave_count: number;
    applicable_on: LeaveApplicableOn;
  };
  carry_forward: boolean;
  transfer_leave_type_id?: string | null;
  transfer_leave_type: LeaveType | null;
  min_waiting_period: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
  user: UserInterface;
}

export interface IFile {
  uuid: string;
  file_name: string;
  file_url: string;
  meta_data?: {
    type: string;
    size: number;
    [key: string]: string | number | boolean | undefined;
  };
  created_at: string;
  updated_at: string;
}

export interface Documents {
  uuid: string;
  attachment: IFile;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Row {
  uuid: string;
  start_date: string;
  end_date: string;
  type: LeaveRequestType;
  range: LeaveRange;
  leave_duration: string;
  reason: string;
  status: LeaveRequestStatus;
  status_changed_by: {
    user_id: string;
    name: string;
    email: string;
  } | null;
  effective_days: string | null;
  penalty: string;
  user: UserInterface;
  leave_type: Pick<LeaveType, "uuid" | "name">;
  managers: Managers[];
  documents: IFile[];
}

export interface BalanceLog {
  uuid: string;
  updated_balance: number;
  amount: number | null;
  source: LeaveBalanceLogSource;
  settled_against_leave_balance_id: string | null;
  leave_request: Row | null;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  uuid: string;
  balance: string;
  leaves_allocated: number;
  period: string;
  sla: string | null;
  final_balance: number | null;
  leave_type: LeaveType;
  balance_logs: BalanceLog[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_sealed: boolean;
}

export interface SelectedLeave {
  uuid: string;
  status_changed_by: [{ user_id: string }] | null;
  leave_type: {
    name: string;
    uuid: string;
    leave_balances: LeaveBalance[];
  };
  penalty: string;
  leave_duration: number;
  managers: Managers[];
  reason: string | null;
  status: LeaveRequestStatus;
  type: string;
  range: string;
  start_date: string;
  end_date: string;
  created_at: string;
  user: UserInterface;
  documents: IFile[];
  effective_days: string;
}

export interface LeaveRequestFilter {
  pagination?: {
    page: number;
    limit: number;
    search?: string;
  };
  status?: LeaveRequestStatus;
  date_range?: {
    start_date: string;
    end_date: string;
  };
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
  effectiveDaysLoading: boolean;
  effectiveDaysRequestId: string | null;
  resolveLeaveBalanceDeficitLoading: boolean;
  getLeaveBalanceLoading: boolean;

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
  userLeaveTypeReport:{
    users: UserInterface[];
    total: number;
    count: number;
    current_page: number;
  } 
  selectedLeaveRequest?: SelectedLeave;
  isSelectedLeaveRequestLoading: boolean;
  leaveRequestFilter?: LeaveRequestFilter;
  userLeaveBalances: LeaveBalance[];
  leaveTypes: LeaveType[];
  userLeaveTypes: LeaveType[];
  requestEffectiveDays: string | null;
  leaveRequestsReport: { status: string; count: string }[] | null;
  leaveRequestsReportLoading: boolean;
}
