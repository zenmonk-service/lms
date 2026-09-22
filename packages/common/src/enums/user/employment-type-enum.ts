import { ENUM } from "../enum";

// Class name mirrors the source's spelling exactly:
// apps/lms-backend/models/tenants/user/enum/employment-type-enum.js (EmployementType)
export class EmployementType extends ENUM {
  static ENUM = {
    PART_TIME: "part_time",
    FULL_TIME: "full_time",
    CONTRACT: "contract",
    INTERN: "internship",
    TEMPORARY: "temporary",
  } as const;
}

export type EmployementTypeType =
  (typeof EmployementType.ENUM)[keyof typeof EmployementType.ENUM];
