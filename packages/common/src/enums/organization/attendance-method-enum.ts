import { ENUM } from "../enum";

export class AttendanceMethod extends ENUM {
  static ENUM = {
    MANUAL: "manual",
    FACE: "face",
    DUAL: "dual",
  } as const;
}

export type AttendanceMethodType =
  (typeof AttendanceMethod.ENUM)[keyof typeof AttendanceMethod.ENUM];
