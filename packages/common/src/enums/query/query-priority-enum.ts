import { ENUM } from "../enum";

export class QueryPriority extends ENUM {
  static ENUM = {
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    URGENT: "Urgent",
  } as const;
}

export type QueryPriorityType =
  (typeof QueryPriority.ENUM)[keyof typeof QueryPriority.ENUM];

