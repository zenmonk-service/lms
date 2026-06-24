export interface CreateLeaveRequestPayload {
  org_uuid: string;
  user_uuid: string;
  leave_type_uuid: string;
  type: string;
  range: string;
  managers: string[];
  date_range: {
    start_date: string;
    end_date: string;
  };
  reason?: string | undefined;
}
