import axiosInterceptorInstance from "@/config/axios";
import { CreateShiftPayload } from "./shift.type";

export const listOrganizationShiftsService = (org_uuid: string) => {
  return axiosInterceptorInstance.get(`/organizations/shifts`, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const createOrganizationShiftsService = (
  org_uuid: string,
  shiftData: Partial<CreateShiftPayload>
) => {
  return axiosInterceptorInstance.post(`/organizations/shifts`, shiftData, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};
