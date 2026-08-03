import { ListOrganizationEventsPayload } from "./list-organization-events.types";
import { bffClient } from "@/config/client";

export const listOrganizationEvents = (payload: ListOrganizationEventsPayload) => {
  const { org_uuid, params } = payload;
  return bffClient.get(`/organizations/events`, {
    headers: {
      org_uuid,
    },
    params
  });
};
