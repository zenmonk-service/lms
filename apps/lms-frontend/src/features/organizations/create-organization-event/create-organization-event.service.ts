import axiosInterceptorInstance from "@/config/axios";
import { CreateOrganizationEventPayload } from "./create-organization-event.types";

export const createOrganizationEvent = (payload: CreateOrganizationEventPayload) => {
  const { org_uuid, ...rest } = payload;
    return axiosInterceptorInstance.post(`/organizations/events`, rest, {
    headers: {
      org_uuid,
    },
  });
};