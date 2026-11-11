import { ENUM } from "../enum";

export class QueryMessageType extends ENUM {
  static ENUM = {
    PUBLIC: "PUBLIC",
    INTERNAL: "INTERNAL",
    SYSTEM: "SYSTEM",
  } as const;
}

export type QueryMessageTypeType =
  (typeof QueryMessageType.ENUM)[keyof typeof QueryMessageType.ENUM];

