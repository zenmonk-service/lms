import axiosInterceptorInstance from "@/config/axios";
import { GetUserAttendancesPayload } from "./get-user-attendances.types";

export const getUserAttendanceService = ({
  org_uuid,
  user_uuid,
  date_range,
  page,
  limit,
}: GetUserAttendancesPayload) => {
  return axiosInterceptorInstance.get(`/organizations/attendances`, {
    params: { user_uuid, date_range, page, limit },
    headers: {
      org_uuid,
    },
  });
};
