import axiosInterceptorInstance from "@/config/axios";
import { ListAllUserAttendancesPayload } from "./list-all-user-attendances.type";

export const listAllUserAttendancesService = ({
  org_uuid,
  search,
  date,
  status,
  page,
  limit,
}: ListAllUserAttendancesPayload) => {
  return axiosInterceptorInstance.get(`/organizations/attendances`, {
    params: { search, date, status, page, limit },
    headers: {
      org_uuid,
    },
  });
};
