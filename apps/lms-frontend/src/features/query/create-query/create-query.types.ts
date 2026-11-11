export interface CreateQueryPayload {
  org_uuid: string;
  data: {
    ticket_number?: string;
    creator_id?: string | number | null;
    assignee_id?: string | number | null;
    assignee_ids?: Array<string | number>;
    subject: string;
    description: string;
    module: string;
    priority?: string;
    assigned_team?: string | null;
    sla_due_at?: string | null;
    resolved_at?: string | null;
    initial_message?: string;
  };
}
