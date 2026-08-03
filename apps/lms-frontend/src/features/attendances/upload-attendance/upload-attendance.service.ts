import axiosInterceptorInstance from "@/config/axios";
import { UploadAttendancePayload } from "./upload-attendance.type";

export const uploadAttendanceReport = (payload: UploadAttendancePayload) => {
  const { org_uuid, type, attendances, date, remark, status } = payload;
  return axiosInterceptorInstance.post(`/attendances/bulk`, { attendances, date, remark, status, type }, {
    headers: {
      "Content-Type": "application/json",
      org_uuid,
    },
  });
};
