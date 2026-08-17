import { bffClient } from "@/config/client";

export const updateAttendance = (payload: UpdateAttendancePayload) => {
  const { org_uuid, ...rest } = payload;
  return bffClient.put(`/attendances/${payload.uuid}`, rest, {
    headers: {
       org_uuid: org_uuid,
    },
  });
};