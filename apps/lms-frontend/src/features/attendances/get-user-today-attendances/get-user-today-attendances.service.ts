import { GetUserTodayAttendancesPayload } from "./get-user-today-attendances.types";
import { bffClient } from "@/config/client";

export const getUserTodayAttendanceService = ({
  org_uuid,
  user_uuid,
}: GetUserTodayAttendancesPayload) => {
  return bffClient.get(`/users/${user_uuid}/attendances`, {
    headers: {
      org_uuid,
    },
  });
};
