import axiosInterceptorInstance from "@/config/axios";
import { ListMissingAttendancesPayload } from "./list-missing-attendances.types";

export const listMissingAttendancesService = (payload: ListMissingAttendancesPayload) => {
    const { org_uuid, params } = payload;
  return axiosInterceptorInstance.get(
    `attendances/missing`,
    {
      headers: { org_uuid },
      params
    }
  );
};