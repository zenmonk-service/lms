import axiosInterceptorInstance from "@/config/axios";
import { CreateMissingAttendancesPayload } from "./create-missing-attendances.types";

export const createMissingAttendancesService = (
  payload: CreateMissingAttendancesPayload,
) => {
  const { org_uuid, records } = payload;
  return axiosInterceptorInstance.post(`attendances/missing`, records, {
    headers: { org_uuid },
  });
};
