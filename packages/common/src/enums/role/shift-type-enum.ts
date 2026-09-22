import { ENUM } from "../enum";

export class ShiftType extends ENUM {
  static ENUM = {
    DAY: "day",
    NIGHT: "night",
  } as const;
}

export type ShiftTypeType = (typeof ShiftType.ENUM)[keyof typeof ShiftType.ENUM];
