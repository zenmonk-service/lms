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


export interface Organization {
  id: string;
  uuid: string;
  name: string;
  domain: string;
  description: string;
  roles: any[];
  is_active: boolean;
  logo_url: string | null;
}

export interface OrganizationSettings {
  theme: {
    name: string;
    value: string;
    base: string;
  };
  work_days: WorkDays[];
  start_time: string;
  end_time: string;
  employee_id_pattern_type: UserIdPattern;
  employee_id_pattern_value: string;
  attendance_method: OrgAttendanceMethod;
}

export interface OrganizationEvents {
  uuid: string;
  title: string;
  description?: string;
  day_status: DayStatus;
  start_date: Date;
  end_date: Date;
}

export interface OrganizationState {
  isLoading: boolean;
  organizations: Organization[];
  organizationSettings: OrganizationSettings | null;
  currentOrganizationAndUser?: Organization;
  currentOrganization: Organization;
  organizationEvents: OrganizationEvents[];
  error: string | null;
  total: number;
  count: number;
  currentPage: number;
  isOrgLoading?: boolean;
  isOrgUpdating?: boolean;
}