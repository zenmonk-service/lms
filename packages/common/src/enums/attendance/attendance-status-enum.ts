import { ENUM } from "../enum";

export class AttendanceStatus extends ENUM {
  static ENUM = {
    PRESENT: "present",
    ABSENT: "absent",
    ON_LEAVE: "on_leave",
    HOLIDAY: "holiday",
    WEEK_OFF: "week_off",
    EARLY_DEPARTURE: "early_departure",
    HALF_DAY: "half_day",
    MISSED_PUNCH: "missed_punch",
    LATE: "late",
    SHORT_LEAVE: "short_leave",
  } as const;
}

export type AttendanceStatusType =
  (typeof AttendanceStatus.ENUM)[keyof typeof AttendanceStatus.ENUM];