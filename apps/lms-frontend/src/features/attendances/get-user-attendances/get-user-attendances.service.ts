import axiosInterceptorInstance from "@/config/axios";
import { GetUserAttendancesPayload } from "./get-user-attendances.types";

export const getUserAttendanceService = ({
  org_uuid,
  status,
  user_name_search,
  user_uuid,
  date_range,
  page,
  limit,
  date,
}: GetUserAttendancesPayload) => {
  return axiosInterceptorInstance.get(`/attendances`, {
    params: { user_uuid, date_range, page, limit, status, user_name_search, date },
    headers: {
      org_uuid,
    },
  });
};
