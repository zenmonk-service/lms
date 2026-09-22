import { ENUM } from "../enum";

export class MaritalStatus extends ENUM {
  static ENUM = {
    SINGLE: "single",
    MARRIED: "married",
    DIVORCED: "divorced",
    WIDOWED: "widowed",
  } as const;
}

export type MaritalStatusType =
  (typeof MaritalStatus.ENUM)[keyof typeof MaritalStatus.ENUM];
