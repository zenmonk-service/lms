import { bffClient } from "@/config/client";

export const updateAttendance = (payload: UpdateAttendancePayload) => {
  return bffClient.put(`/attendances/${payload.uuid}`, payload, {
    headers: {
       org_uuid: payload.org_uuid as string,
    },
  });
};