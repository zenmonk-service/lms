import axiosInterceptorInstance from "@/config/axios";

export const getPublicHolidays = () => {
  return axiosInterceptorInstance.get(`/holidays`);
};
