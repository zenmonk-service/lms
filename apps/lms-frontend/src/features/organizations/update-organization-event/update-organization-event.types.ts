import { CreateOrganizationEventPayload } from "../create-organization-event/create-organization-event.types";

export interface UpdateOrganizationEventPayload extends Partial<CreateOrganizationEventPayload>{
    org_uuid: string;
    event_uuid: string;
}