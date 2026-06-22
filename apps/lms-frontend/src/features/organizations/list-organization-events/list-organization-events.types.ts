export interface ListOrganizationEventsPayload {
  org_uuid: string;
  params?: {
    year?: number;
    month?: number;
    start_date?: string;
    end_date?: string;
    limit?: number;
  };
}
