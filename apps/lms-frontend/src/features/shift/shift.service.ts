import axiosInterceptorInstance from "@/config/axios";
import { CreateShiftPayload } from "./shift.type";

export const listOrganizationShiftsService = (org_uuid: string) => {
  return axiosInterceptorInstance.get(`/organizations/shifts`, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const createOrganizationShiftService = (
  org_uuid: string,
  shiftData: Partial<CreateShiftPayload>
) => {
  return axiosInterceptorInstance.post(`/organizations/shifts`, shiftData, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};

export const updateOrganizationShiftService = (
  org_uuid: string,
  uuid: string,
  shiftData: Partial<CreateShiftPayload>
) => {
  return axiosInterceptorInstance.put(
    `/organizations/shifts/${uuid}`,
    shiftData,
    {
      headers: {
        org_uuid: org_uuid,
      },
    }
  );
};

export const deleteOrganizationShiftService = (
  org_uuid: string,
  uuid: string
) => {
  return axiosInterceptorInstance.delete(`/organizations/shifts/${uuid}`, {
    headers: {
      org_uuid: org_uuid,
    },
  });
};
