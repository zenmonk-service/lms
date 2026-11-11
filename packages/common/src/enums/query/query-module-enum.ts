import { ENUM } from "../enum";

export class QueryModule extends ENUM {
  static ENUM = {
    PAYROLL: "Payroll",
    ATTENDANCE: "Attendance",
    LEAVE: "Leave",
    IT_ASSETS: "IT Assets",
    OTHER: "Other",
  } as const;
}

export type QueryModuleType =
  (typeof QueryModule.ENUM)[keyof typeof QueryModule.ENUM];

