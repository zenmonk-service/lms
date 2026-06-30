export interface ListPayrollPayload {
    org_uuid: string;
    params?: {
        month: number;
        year: number;
        page: number;
        limit: number;
        search?: string;
    }
}