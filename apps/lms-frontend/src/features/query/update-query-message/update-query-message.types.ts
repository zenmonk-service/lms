export interface UpdateQueryMessagePayload {
  org_uuid: string;
  query_uuid: string;
  message_uuid: string;
  /** Only the text can be edited; the attachment never changes. */
  data: {
    content: string;
  };
}
