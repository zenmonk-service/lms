export interface CreateQueryPayload {
  org_uuid: string;
  data: {
    assignee_id?: string | number | null;
    assignee_ids?: Array<string | number>;
    subject: string;
    description: string;
    module: string;
    priority?: string;
    resolved_at?: string | null;
    initial_message?: string;
  };
}
