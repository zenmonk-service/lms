import { ENUM } from "../enum";

export class HolidayType extends ENUM {
  static ENUM = {
    PUBLIC: "public",
    COMPANY: "organization",
    OPTIONAL: "optional",
  } as const;
}

export type HolidayTypeType = (typeof HolidayType.ENUM)[keyof typeof HolidayType.ENUM];
