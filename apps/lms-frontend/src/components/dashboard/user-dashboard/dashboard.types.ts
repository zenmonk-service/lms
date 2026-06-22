import { LeaveRequestStatus } from "@/features/leave/leave.types";

export interface AttendanceRow {
  date: string;
  status: string;
}

export interface LeaveRow {
  uuid: string;
  status: LeaveRequestStatus | string;
  leave_type?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  reason?: string;
  leave_duration?: string;
}

export interface AttendanceSummary {
  present: number;
  absent: number;
  on_leave: number;
}

export interface LeaveStatusSummary {
  approved: number;
  rejected: number;
  pending: number;
  recommended: number;
  cancelled: number;
}

export interface AttendanceChartDatum {
  name: string;
  value: number;
  color: string;
  fill: string;
}

export interface LeaveChartDatum {
  status: string;
  total: number;
  fill: string;
}

export interface MonthOption {
  value: number;
  label: string;
}