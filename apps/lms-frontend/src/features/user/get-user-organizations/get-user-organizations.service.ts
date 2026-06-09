import axiosInterceptorInstance from "@/config/axios";

export const getUserOrganizations = (userId: string) => {
  return axiosInterceptorInstance.get(`/users/${userId}/organizations`);
};
