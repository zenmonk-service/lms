import axiosInterceptorInstance from "@/config/axios";
import { GetUserAttendancesPayload } from "./get-user-attendances.types";

export const getUserAttendanceService = ({
  org_uuid,
  user_uuid,
  date_range,
  page,
  limit,
  date,
}: GetUserAttendancesPayload) => {
  return axiosInterceptorInstance.get(`/organizations/attendances`, {
    params: { user_uuid, date_range, date, page, limit },
    headers: {
      org_uuid,
    },
  });
};
