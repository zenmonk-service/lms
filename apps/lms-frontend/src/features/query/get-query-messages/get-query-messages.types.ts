// A type alias (not an interface) so it fits the client's query-params record type.
export type GetQueryMessagesParams = {
  limit?: number;
  /** Uuid of the oldest loaded message; omitted for the latest messages. */
  before?: string;
  message_type?: string;
};

export interface GetQueryMessagesPayload {
  org_uuid: string;
  query_uuid: string;
  params?: GetQueryMessagesParams;
}

export interface GetQueryMessagesResponse {
  /** Oldest -> newest. */
  rows: import("../query.types").QueryMessage[];
  has_more: boolean;
  limit: number;
}
