import axiosInterceptorInstance from "@/config/axios";

export const createAttendance = (payload: CreateAttendancePayload) => {
  return axiosInterceptorInstance.post(`/organizations/attendances`, payload, {
    headers: {
       org_uuid: payload.org_uuid as string,
    },
  });
};