export interface LeaveBalanceAdjustmentPayload {
  leave_balance_uuid: string;
  updated_balance: number;
  amount: number;
  is_credit: boolean;
  settled_against_uuid: string;
}

export interface ResolveLeaveBalanceDeficitPayload {
  org_uuid: string;
  user_uuid: string;
  adjustments: LeaveBalanceAdjustmentPayload[];
}
