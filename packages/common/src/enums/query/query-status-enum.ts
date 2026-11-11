import { ENUM } from "../enum";

export class QueryStatus extends ENUM {
  static ENUM = {
    OPEN: "OPEN",
    IN_PROGRESS: "IN_PROGRESS",
    PENDING_EMP: "PENDING_EMP",
    RESOLVED: "RESOLVED",
  } as const;
}

export type QueryStatusType =
  (typeof QueryStatus.ENUM)[keyof typeof QueryStatus.ENUM];

