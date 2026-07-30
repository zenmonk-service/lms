export interface CreateLeaveTypePayload {
    org_uuid: string;
    name: string;
    code: string;
    description?: string;
    users: string[];
    roles: string[];
    is_sandwich_enabled: boolean;
    is_clubbing_enabled: boolean;
    allow_negative_leaves: boolean;
    max_consecutive_days?: number;
    accrual: {
        period: "none" | "monthly" | "yearly" | "quarterly" | "half_yearly";
        applicable_on: string;
        leave_count: number;
    };
    carry_forward: boolean;
}