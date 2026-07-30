import { PublicRoleEnum } from "../user/user.type";

export enum WorkDays {
  SUNDAY = "sunday",
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
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
  ACTIVATE_ORGANIZATION = "organization/activate",
  DEACTIVATE_ORGANIZATION = "organization/deactivate",

  LIST_ORGANIZATION_EVENTS = "organization/list-events",
  CREATE_ORGANIZATION_EVENT = "organization/create-event",
  UPDATE_ORGANIZATION_EVENT = "organization/update-event",
  DELETE_ORGANIZATION_EVENT = "organization/delete-event",

  GET_ORGANIZATION_SETTINGS = "organization/get-settings",
  UPDATE_ORGANIZATION_SETTINGS = "organization/update-settings",

  LIST_ORGANIZATION_USERS = "organization/list-users",

  LIST_USER_ORGANIZATIONS = "organization/list-user-organizations",
}

export enum EmployeeIdMode {
  AUTO = "auto",
  MANUAL = "manual",
}
export interface Organization {
  id: string;
  uuid: string;
  name: string;
  domain: string;
  is_active: boolean;
  logo_url: string | null;
  users: {
    user_id: string;
    name: string;
    email: string;
    role: PublicRoleEnum;
    created_at: string;
    updated_at: string;
  }[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
  employee_id_pattern: {
    type: EmployeeIdMode;
    value: string[];
  };
  attendance_method: OrgAttendanceMethod;
  past_dated_leave?: {
    balance?: number;
    tenure?: string;
  };
  sandwich_leave_exception?: {
    isApplicable?: boolean;
    roles: string[];
    users: string[];
    accrual_period?: string;
  };
  clubbing_leave_exception?: {
    isApplicable?: boolean;
    roles: string[];
    users: string[];
    accrual_period?: string;
  };
}

export interface OrganizationEvents {
  uuid: string;
  title: string;
  description?: string;
  day_status: DayStatus;
  start_date: string;
  end_date: string;
}

export interface OrganizationState {
  isLoading: boolean;
  organizations: Organization[];
  organizationSettings: OrganizationSettings | null;
  currentOrganization: Organization;
  organizationEvents: OrganizationEvents[];
  error: string | null;
  total: number;
  count: number;
  currentPage: number;
  isOrgLoading?: boolean;
  isOrgUpdating?: boolean;
}