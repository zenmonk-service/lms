export interface ListUserLeaveBalancePayload {
    org_uuid: string;
    user_uuid: string;
    period: string;
    is_sealed: boolean;
}