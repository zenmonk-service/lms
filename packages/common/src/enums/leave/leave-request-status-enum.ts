import { ENUM } from "../enum";

export class LeaveRequestStatus extends ENUM {
  static ENUM = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    RECOMMENDED: "Recommended",
    EXPIRED: "Expired",
  } as const;
}

export type LeaveRequestStatusType =
  (typeof LeaveRequestStatus.ENUM)[keyof typeof LeaveRequestStatus.ENUM];
