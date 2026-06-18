export interface GetRequestEffectiveDaysPayload {
  org_uuid: string;
  leave_type_uuid: string;
  start_date: string;
  end_date: string;
  type: string;
  range: string;
}
