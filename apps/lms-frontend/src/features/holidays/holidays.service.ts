import axiosInterceptorInstance from "@/config/axios";

export const getPublicHolidays = (year?: number) => {
  return axiosInterceptorInstance.get(`/holidays`, {params: { year }});
};
