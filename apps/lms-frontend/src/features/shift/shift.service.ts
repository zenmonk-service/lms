import axiosInterceptorInstance from "@/config/axios";

export const listOrganizationShiftsService = () => {
  return axiosInterceptorInstance.get(`/organizations/shifts`);
};