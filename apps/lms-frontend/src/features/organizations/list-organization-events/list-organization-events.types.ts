export interface ListOrganizationEventsPayload {
  org_uuid: string;
  params?: {
    year?: number;
    period?: string;
    start_date?: string;
    end_date?: string;
    limit?: number;
  };
}
