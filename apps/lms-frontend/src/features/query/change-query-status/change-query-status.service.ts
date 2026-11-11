import { bffClient } from "@/config/client";
import { ChangeQueryStatusPayload } from "./change-query-status.types";

export const changeQueryStatus = (payload: ChangeQueryStatusPayload) => {
  const { org_uuid, query_uuid, data } = payload;

  return bffClient.patch(`/queries/${query_uuid}/status`, data, {
    headers: {
      org_uuid,
    },
  });
};
