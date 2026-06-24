import axiosInterceptorInstance from "@/config/axios";

export const getOrganizationUser = (user_uuid: string, org_uuid: string) => {
  return axiosInterceptorInstance.get(`/organizations/users/${user_uuid}`, {
    headers: {
      org_uuid,
    },
  });
};
