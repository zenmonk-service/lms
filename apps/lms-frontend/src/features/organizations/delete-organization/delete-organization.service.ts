import axiosInterceptorInstance from "@/config/axios";
import { DeleteOrganizationPayload } from "./delete-organization.types";

export const deleteOrganization = (payload: DeleteOrganizationPayload) => {
  const { org_uuid } = payload;
  return axiosInterceptorInstance.delete(`/organizations/${org_uuid}`);
};
