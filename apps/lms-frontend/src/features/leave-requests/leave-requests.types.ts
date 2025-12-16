export enum LeaveRange {
  FULL_DAY = "full_day",
  FIRST_HALF = "first_half",
  SECOND_HALF = "second_half",
  FIRST_QUARTER = "first_quarter",
  SECOND_QUARTER = "second_quarter",
  THIRD_QUARTER = "third_quarter",
  FOURTH_QUARTER = "fourth_quarter",
}

export enum LeaveRequestType {
  FULL_DAY = "full_day",
  HALF_DAY = "half_day",
  SHORT_LEAVE = "short_leave",
}

export enum LeaveRequestStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  CANCELLED = "Cancelled",
  RECOMMENDED = "Recommended",
}
