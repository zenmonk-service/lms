export const listOrganizationShiftsType = "organization-shifts/list";
export const createOrganizationShiftType = "organization-shifts/create";

export interface ListShift {
  org_uuid: string;
}

export interface CreateShiftPayload {
  org_uuid: string;
  name: string;
  start_time: string;
  end_time: string;
  effective_hours: number;
  flexible_time: string;
}
