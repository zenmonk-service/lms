import { ENUM } from "../enum";

// Filename mirrors the source's spelling exactly:
// apps/lms-backend/models/tenants/organization/enum/cutoff-allocaion-type-enum.js
export class CutoffAllocationType extends ENUM {
  static ENUM = {
    NO_LEAVE: "no_leave",
    HALF_MONTH: "half_month",
    FULL_MONTH: "full_month",
  } as const;
}

export type CutoffAllocationTypeType =
  (typeof CutoffAllocationType.ENUM)[keyof typeof CutoffAllocationType.ENUM];
