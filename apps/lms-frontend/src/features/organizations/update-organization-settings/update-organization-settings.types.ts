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
  flexible_time?: string|null;
  late_exception?: {
    isApplicable: boolean;
    tenure?: string;
    count?: number;
    time?: string | null;
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
