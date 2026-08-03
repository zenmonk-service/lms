import { CreateMissingAttendancesPayload } from "./create-missing-attendances.types";
import { bffClient } from "@/config/client";

export const createMissingAttendancesService = (
  payload: CreateMissingAttendancesPayload,
) => {
  const { org_uuid, records } = payload;
  return bffClient.post(`/attendances/missing`, records, {
    headers: { org_uuid },
  });
};
