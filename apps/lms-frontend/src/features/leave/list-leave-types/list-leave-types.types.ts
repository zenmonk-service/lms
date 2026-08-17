export interface ListLeaveTypesPayload {
    org_uuid: string;
    params?: {
        user_uuid: string;
        role_uuid: string;
        period: string;
    }
}