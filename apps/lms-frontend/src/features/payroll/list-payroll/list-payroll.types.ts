export interface ListPayrollPayload {
    org_uuid: string;
    params?: {
        period: string;
        page: number;
        limit: number;
        search?: string;
    }
}