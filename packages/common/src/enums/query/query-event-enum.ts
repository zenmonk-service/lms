import { ENUM } from "../enum";

/** Realtime events published on a query's channel (and the organization channel for status changes). */
export class QueryEvent extends ENUM {
  static ENUM = {
    MESSAGE_CREATED: "query_message_created",
    MESSAGE_UPDATED: "query_message_updated",
    MESSAGE_DELETED: "query_message_deleted",
    STATUS_CHANGED: "query_status_changed",
    MEMBERS_CHANGED: "query_members_changed",
  } as const;
}

export type QueryEventType =
  (typeof QueryEvent.ENUM)[keyof typeof QueryEvent.ENUM];
