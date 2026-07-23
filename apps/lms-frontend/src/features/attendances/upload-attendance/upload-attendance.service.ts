import axiosInterceptorInstance from "@/config/axios";
import { UploadAttendancePayload } from "./upload-attendance.type";

export const uploadAttendanceReport = (payload: UploadAttendancePayload) => {
  return axiosInterceptorInstance.post(`/attendances/upload`, payload, {
    headers: {
      "Content-Type": "application/json",
       "org_uuid": payload.org_uuid,
    },
  });
};