import { GetUserAttendancesPayload } from "./get-user-attendances.types";
import { bffClient } from "@/config/client";

export const getUserAttendanceService = (payload: GetUserAttendancesPayload) => {
  const { org_uuid, params } = payload;
  return bffClient.get(`/attendances`, {
    params,
    headers: { org_uuid },
  });
};
