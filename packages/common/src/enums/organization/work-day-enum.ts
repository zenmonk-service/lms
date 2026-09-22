import { ENUM } from "../enum";

export class WorkDay extends ENUM {
  static ENUM = {
    MONDAY: "monday",
    TUESDAY: "tuesday",
    WEDNESDAY: "wednesday",
    THURSDAY: "thursday",
    FRIDAY: "friday",
    SATURDAY: "saturday",
    SUNDAY: "sunday",
  } as const;
}

export type WorkDayType = (typeof WorkDay.ENUM)[keyof typeof WorkDay.ENUM];
