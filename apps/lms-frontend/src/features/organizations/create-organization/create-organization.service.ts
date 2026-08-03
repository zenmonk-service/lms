import { CreateOrganizationPayload } from "./create-organization.types";
import { bffClient } from "@/config/client";

export const createOrganization = (payload: CreateOrganizationPayload) => {
  return bffClient.post(`/organizations`, payload);
};
