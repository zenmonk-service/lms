import { AttendanceStatus } from "../attendances/attendances.type";
import { UserInterface } from "../user/user.type";
import { DeepPartial } from "react-hook-form";

export const enum PayrollActionType {
  LIST_PAYROLL = "payroll/list-payroll",
  GENERATE_PAYROLL = "payroll/generate-payroll",
  UPDATE_PAYROLL = "payroll/update-payroll",
  DOWNLOAD_PAYROLL = "payroll/download-payroll",
}
export interface LeaveBalanceDeficit {
  code: string;
  name: string;
  balance: string;
  final_balance: string | null;
  leaves_allocated: number;
}
export interface PayrollRow {
  id: string;
  leave_balance_deficit: LeaveBalanceDeficit[];
  attendance_penalty: Record<AttendanceStatus, string>;
  user: DeepPartial<UserInterface>;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface Payroll {
  count: number;
  rows: PayrollRow[];
  current_page: number;
  per_page: number;
  total: number;
}

export interface PayrollState {
  isLoading: boolean;
  isDownloading: boolean;
  payroll: Payroll;
}
