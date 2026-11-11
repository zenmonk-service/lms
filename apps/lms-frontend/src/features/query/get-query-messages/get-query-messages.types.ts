export interface GetQueryMessagesPayload {
  org_uuid: string;
  query_uuid: string;
  params?: {
    page?: number;
    limit?: number;
    message_type?: string;
  };
}
