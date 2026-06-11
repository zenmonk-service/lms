import axiosInterceptorInstance from "@/config/axios";
import { GetOrganizationSettingsPayload } from "./get-organization-settings.types";

export const getOrganizationSettings = (payload: GetOrganizationSettingsPayload) => {
  const { org_uuid } = payload;
  return axiosInterceptorInstance.get(`/organizations/settings`, {
    headers: {
      org_uuid,
    },
  });
};
