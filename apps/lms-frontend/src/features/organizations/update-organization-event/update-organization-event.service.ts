import axiosInterceptorInstance from "@/config/axios";
import { UpdateOrganizationEventPayload } from "./update-organization-event.types";

export const updateOrganizationEvent = (
  payload: UpdateOrganizationEventPayload,
) => {
  const { org_uuid, event_uuid, ...data } = payload;
  return axiosInterceptorInstance.put(
    `/organizations/events/${event_uuid}`,
    data,
    {
      headers: {
        org_uuid: org_uuid,
      },
    },
  );
};
