export interface UpdateQueryMessagePayload {
  org_uuid: string;
  query_uuid: string;
  message_uuid: string;
  data: {
    content: string;
  };
}
