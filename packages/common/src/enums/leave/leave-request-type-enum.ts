import { ENUM } from "../enum";

export class LeaveRequestType extends ENUM {
  static ENUM = {
    FULL_DAY: "full_day",
    HALF_DAY: "half_day",
    SHORT_LEAVE: "short_leave",
  } as const;
}

export type LeaveRequestTypeType =
  (typeof LeaveRequestType.ENUM)[keyof typeof LeaveRequestType.ENUM];
