export interface OrganizationFetchPayload {
  uuid?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export enum WorkDays {
  SUNDAY = "sunday",
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
}

export enum UserIdPattern {
  ALPHA_NUMERIC = "alpha_numeric",
  NUMERIC = "numeric",
}

export enum OrgAttendanceMethod {
  MANUAL = "manual",
  FACE = "face",
  DUAL = "dual",
}

export enum DayStatus {
  ORGANIZATION_HOLIDAY = "organization_holiday",
  WORKING_DAY = "working_day",
  SPECIAL_EVENT = "special_event",
  PUBLIC_HOLIDAY = "public_holiday",
}
