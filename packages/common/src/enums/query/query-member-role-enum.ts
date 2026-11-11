import { ENUM } from "../enum";

export class QueryMemberRole extends ENUM {
  static ENUM = {
    ASSIGNEE: "ASSIGNEE",
    PRIMARY_ASSIGNEE: "PRIMARY_ASSIGNEE",
    RESOLVER: "RESOLVER",
    WATCHER: "WATCHER",
  } as const;
}

export type QueryMemberRoleType =
  (typeof QueryMemberRole.ENUM)[keyof typeof QueryMemberRole.ENUM];

