import {
  OrgAttendanceMethod,
  UserIdPattern,
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
  employee_id_pattern_type: UserIdPattern;
  employee_id_pattern_value: string;
  theme: {
    name: string;
    value: string;
    base: string;
  };
}
