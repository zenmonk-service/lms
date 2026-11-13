import { ENUM } from "../enum";

/** Fixed Redis pub/sub channels (organization and query channels are built from uuids). */
export class RedisChannel extends ENUM {
  static ENUM = {
    NOTIFICATION_EVENTS: "notification_events",
  } as const;
}

export type RedisChannelType =
  (typeof RedisChannel.ENUM)[keyof typeof RedisChannel.ENUM];
