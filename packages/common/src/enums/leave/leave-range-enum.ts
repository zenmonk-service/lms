import { ENUM } from "../enum";

export class LeaveRange extends ENUM {
  static ENUM = {
    FULL_DAY: "full_day",
    FIRST_HALF: "first_half",
    SECOND_HALF: "second_half",
    FIRST_QUARTER: "first_quarter",
    SECOND_QUARTER: "second_quarter",
    THIRD_QUARTER: "third_quarter",
    FOURTH_QUARTER: "fourth_quarter",
  } as const;
}

export type LeaveRangeType = (typeof LeaveRange.ENUM)[keyof typeof LeaveRange.ENUM];
