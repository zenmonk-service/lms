import { ENUM } from "../enum";

export class EmployeeIdMode extends ENUM {
  static ENUM = {
    AUTO: "auto",
    MANUAL: "manual",
  } as const;
}

export type EmployeeIdModeType =
  (typeof EmployeeIdMode.ENUM)[keyof typeof EmployeeIdMode.ENUM];
