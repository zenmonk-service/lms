import { ENUM } from "../enum";

export class DayStatus extends ENUM {
  static ENUM = {
    ORGANIZATION_HOLIDAY: "organization_holiday",
    WORKING_DAY: "working_day",
    SPECIAL_EVENT: "special_event",
    PUBLIC_HOLIDAY: "public_holiday",
  } as const;
}

export type DayStatusType = (typeof DayStatus.ENUM)[keyof typeof DayStatus.ENUM];
