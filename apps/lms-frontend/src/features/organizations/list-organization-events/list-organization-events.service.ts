import axiosInterceptorInstance from "@/config/axios";
import { ListOrganizationEventsPayload } from "./list-organization-events.types";

export const listOrganizationEvents = (payload: ListOrganizationEventsPayload) => {
  const { org_uuid, year } = payload;
  return axiosInterceptorInstance.get(`/organizations/events`, {
    headers: {
      org_uuid,
    },
    params: {
      year,
    },
  });
};
