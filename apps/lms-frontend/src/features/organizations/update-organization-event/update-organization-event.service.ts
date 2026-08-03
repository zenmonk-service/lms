import { UpdateOrganizationEventPayload } from "./update-organization-event.types";
import { bffClient } from "@/config/client";

export const updateOrganizationEvent = (
  payload: UpdateOrganizationEventPayload,
) => {
  const { org_uuid, event_uuid, ...data } = payload;
  return bffClient.put(
    `/organizations/events/${event_uuid}`,
    data,
    {
      headers: {
        org_uuid: org_uuid,
      },
    },
  );
};
