import { ENUM } from "../enum";

export class TimePeriod extends ENUM {
  static ENUM = {
    NONE: "none",
    MONTHLY: "monthly",
    QUARTERLY: "quarterly",
    HALF_YEARLY: "half_yearly",
    YEARLY: "yearly",
  } as const;
}

export type TimePeriodType = (typeof TimePeriod.ENUM)[keyof typeof TimePeriod.ENUM];
