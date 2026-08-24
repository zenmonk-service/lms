import {
  EmployeeIdMode,
  OrgAttendanceMethod,
  WorkDays,
} from "../organizations.types";

export interface UpdateOrganizationSettingsPayload extends Partial<OrganizationSettingsState> {
  org_uuid: string;
}

interface OrganizationSettingsState {
  attendance_method: OrgAttendanceMethod;
  work_days: WorkDays[];
  start_time: string;
  end_time: string;
  flexible_time?: number|null;
  late_exception?: {
    is_applicable: boolean;
    tenure?: string;
    balance?: number;
    grace_duration?: number | null;
  }|null;
  employee_id_pattern: {
    type: EmployeeIdMode;
    value?: string[];
  }
  theme: {
    name: string;
    value: string;
    base: string;
  };
  past_dated_leave: {
    balance?: number | null;
    tenure?: string | null;
  } | null;
}
