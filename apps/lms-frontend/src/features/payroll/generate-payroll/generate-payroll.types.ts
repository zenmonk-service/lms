export interface GeneratePayrollPayload {
  org_uuid: string;
  payroll_id?: string;
  params: {
    period: string;
  };
}
