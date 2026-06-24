import axiosInterceptorInstance from "@/config/axios";
import { DeleteOrganizationEventPayload } from "./delete-organization-event.types";

export const deleteOrganizationEvent = (
  payload: DeleteOrganizationEventPayload,
) => {
  const { org_uuid, event_uuid } = payload;
  return axiosInterceptorInstance.delete(
    `/organizations/events/${event_uuid}`,
    {
      headers: {
        org_uuid: org_uuid,
      },
    },
  );
};
