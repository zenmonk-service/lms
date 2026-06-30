export interface GeneratePayrollPayload {
    org_uuid: string;
    params: {
        month: number;
        year: number;
    }
}