import axiosInterceptorInstance from "@/config/axios";
import { ListShift } from "./shift.type";

export const listOrganizationShiftsService = (payload: ListShift) => {
  return axiosInterceptorInstance.get(`/organizations/shifts`,  {
    headers: {
      org_uuid: payload.org_uuid,
    },
  });
};