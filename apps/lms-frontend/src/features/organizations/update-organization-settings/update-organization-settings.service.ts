import axiosInterceptorInstance from "@/config/axios";
import { UpdateOrganizationSettingsPayload } from "./update-organization-settings.types";

export const updateOrganizationSettings = (payload: UpdateOrganizationSettingsPayload) => {
  const { org_uuid, ...data } = payload;
  return axiosInterceptorInstance.put(`/organizations/settings`, data, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};
