export interface CreateLeaveTypePayload {
    org_uuid: string;
    name: string;
    code: string;
    description: string;
    applicable_for: {
        type: "role" | "employee";
        value: string;
    };
    is_sandwich_enabled: boolean;
    is_clubbing_enabled: boolean;
    allow_negative_leaves: boolean;
    max_consecutive_days?: number;
    accrual: {
        period: string;
        applicable_on: string;
        leave_count: number;
    };
    carry_forward: boolean;

}