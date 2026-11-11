export interface ChangeQueryStatusPayload {
  org_uuid: string;
  query_uuid: string;
  data: {
    status: string;
    note?: string;
  };
}
