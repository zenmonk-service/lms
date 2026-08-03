import { bffClient } from "@/config/client";

export const createAttendance = (payload: CreateAttendancePayload) => {
  return bffClient.post(`/attendances`, payload, {
    headers: {
       org_uuid: payload.org_uuid as string,
    },
  });
};