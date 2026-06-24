import { CreateOrganizationPayload } from "../create-organization/create-organization.types";

export interface UpdateOrganizationPayload extends Partial<CreateOrganizationPayload> {
  org_uuid: string;
}
