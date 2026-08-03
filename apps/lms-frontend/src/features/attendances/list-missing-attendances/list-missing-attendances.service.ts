import { ListMissingAttendancesPayload } from "./list-missing-attendances.types";
import { bffClient } from "@/config/client";

export const listMissingAttendancesService = (payload: ListMissingAttendancesPayload) => {
    const { org_uuid, params } = payload;
  return bffClient.get(
    `/attendances/missing`,
    {
      headers: { org_uuid },
      params
    }
  );
};