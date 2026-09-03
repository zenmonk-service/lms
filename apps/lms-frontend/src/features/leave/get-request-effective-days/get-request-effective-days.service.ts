import { GetRequestEffectiveDaysPayload } from "./get-request-effective-days.types";
import { bffClient } from "@/config/client";

export const getRequestEffectiveDays = (
  payload: GetRequestEffectiveDaysPayload,
  signal: AbortSignal,
) => {
  const { org_uuid, ...params } = payload;
  return bffClient.get(`/leave-requests/effective-days`, {
    params,
    headers: {
      org_uuid,
    },
    signal
  });
};
