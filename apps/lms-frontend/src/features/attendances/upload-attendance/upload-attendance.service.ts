import axiosInterceptorInstance from "@/config/axios";

export const uploadAttendanceReport = (payload:  FormData) => {
  return axiosInterceptorInstance.post(`/organizations/attendances/upload`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
       org_uuid: payload.get("org_uuid") as string,
    },
  });
};