import axiosInterceptorInstance from "@/config/axios";

export const updateAttendance = (payload: UpdateAttendancePayload) => {
  return axiosInterceptorInstance.put(`/attendances/${payload.uuid}`, payload, {
    headers: {
       org_uuid: payload.org_uuid as string,
    },
  });
};