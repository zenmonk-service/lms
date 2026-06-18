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

export enum OrganizationActionType {
  LOGIN_ORGANIZATION = "organization/login",

  GET_ORGANIZATION = "organization/get",
  LIST_ORGANIZATIONS = "organization/list",
  CREATE_ORGANIZATION = "organization/create",
  UPDATE_ORGANIZATION = "organization/update",
  DELETE_ORGANIZATION = "organization/delete",

  LIST_ORGANIZATION_EVENTS = "organization/list-events",
  CREATE_ORGANIZATION_EVENT = "organization/create-event",
  UPDATE_ORGANIZATION_EVENT = "organization/update-event",
  DELETE_ORGANIZATION_EVENT = "organization/delete-event",

  GET_ORGANIZATION_SETTINGS = "organization/get-settings",
  UPDATE_ORGANIZATION_SETTINGS = "organization/update-settings",

  LIST_ORGANIZATION_USERS = "organization/list-users",

  LIST_USER_ORGANIZATIONS = "organization/list-user-organizations",
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