import axiosInterceptorInstance from "@/config/axios";
import { GetUserTodayAttendancesPayload } from "./get-user-today-attendances.types";

export const getUserTodayAttendanceService = ({
  org_uuid,
  user_uuid,
}: GetUserTodayAttendancesPayload) => {
  return axiosInterceptorInstance.get(`/users/${user_uuid}/attendances`, {
    headers: {
      org_uuid,
    },
  });
};
