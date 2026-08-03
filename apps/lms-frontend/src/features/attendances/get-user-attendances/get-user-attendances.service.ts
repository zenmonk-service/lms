import axiosInterceptorInstance from "@/config/axios";
import { GetUserAttendancesPayload } from "./get-user-attendances.types";

export const getUserAttendanceService = (payload: GetUserAttendancesPayload) => {
  const { org_uuid, params } = payload;
  return axiosInterceptorInstance.get(`/attendances`, {
    params,
    headers: { org_uuid },
  });
};
