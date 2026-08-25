import { UpdateOrganizationSettingsPayload } from "@/features/organizations/update-organization-settings/update-organization-settings.types";

export interface UpdateRolePayload {
  role_uuid: string;
  org_uuid: string;
  name?: string;
  description?: string;
  organization_setting?:UpdateOrganizationSettingsPayload;
}
