import { UploadAttendancePayload } from "./upload-attendance.type";
import { bffClient } from "@/config/client";

export const uploadAttendanceReport = (payload: UploadAttendancePayload) => {
  return bffClient.post(`/attendances/bulk`,payload, {
    headers: {
      "Content-Type": "application/json",
       org_uuid : payload.org_uuid,
    },
  });
};
