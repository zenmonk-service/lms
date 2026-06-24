import { DayStatus } from "../organizations.types";

export interface CreateOrganizationEventPayload {
  org_uuid: string;
  title: string;
  description: string;
  day_status: DayStatus;
  start_date: Date;
  end_date: Date;
}
