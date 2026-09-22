import { ENUM } from "../enum";

// Frontend-only today — apps/lms-backend validates leave_type.applicable_on
// as a plain required field (leave-type-model.js) without a dedicated enum
// class, unlike every other enum in this package.
export class LeaveApplicableOn extends ENUM {
  static ENUM = {
    START_OF_MONTH: "start_of_month",
    END_OF_MONTH: "end_of_month",
  } as const;
}

export type LeaveApplicableOnType =
  (typeof LeaveApplicableOn.ENUM)[keyof typeof LeaveApplicableOn.ENUM];
