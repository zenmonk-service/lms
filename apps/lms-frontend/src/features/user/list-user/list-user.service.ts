import axiosInterceptorInstance from "@/config/axios";

export const listUser = (
  filters: { page: number; limit?: number; search?: string },
  org_uuid: string,
) => {
  return axiosInterceptorInstance.get(`/users`, {
    params: filters,
    headers: {
      org_uuid,
    },
  });
};
