export interface GeneratePayrollPayload {
    org_uuid: string;
    payroll_id?: string;
    params: {
        month: number;
        year: number;
    }
}