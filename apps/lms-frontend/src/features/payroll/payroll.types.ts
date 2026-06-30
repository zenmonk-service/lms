import { AttendanceStatus } from "../attendances/attendances.type";
import { UserInterface } from "../user/user.type";
import { DeepPartial } from "react-hook-form";

export const enum PayrollActionType {
  LIST_PAYROLL = "payroll/list-payroll",
  GENERATE_PAYROLL = "payroll/generate-payroll",
}

export interface PayrollRow {
  id: string;
  leave_balance_deficit: string;
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
  payroll: Payroll;
}
