import { CreateOrganizationEventPayload } from "./create-organization-event.types";
import { bffClient } from "@/config/client";

export const createOrganizationEvent = (payload: CreateOrganizationEventPayload) => {
  const { org_uuid, ...rest } = payload;
    return bffClient.post(`/organizations/events`, rest, {
    headers: {
      org_uuid,
    },
  });
};