import { ENUM } from "../enum";

/** Actions the browser sends to the websocket service. */
export class SocketAction extends ENUM {
  static ENUM = {
    SUBSCRIBE: "subscribe",
    UNSUBSCRIBE: "unsubscribe",
    SUBSCRIBE_QUERY: "subscribe_query",
    UNSUBSCRIBE_QUERY: "unsubscribe_query",
    MARK_NOTIFICATION: "mark_notification",
    MARK_ALL_NOTIFICATION: "mark_all_notification",
  } as const;
}

export type SocketActionType =
  (typeof SocketAction.ENUM)[keyof typeof SocketAction.ENUM];
