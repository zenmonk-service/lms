import { ENUM } from "../enum";

/** Special `send_to` values for realtime messages; otherwise `send_to` is a user uuid or a list of them. */
export class MessageRecipient extends ENUM {
  static ENUM = {
    EVERYONE: "everyone",
  } as const;
}

export type MessageRecipientType =
  (typeof MessageRecipient.ENUM)[keyof typeof MessageRecipient.ENUM];
