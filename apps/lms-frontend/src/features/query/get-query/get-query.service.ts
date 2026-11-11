import { bffClient } from "@/config/client";
import { GetQueryPayload } from "./get-query.types";

export const getQuery = (payload: GetQueryPayload) => {
  const { org_uuid, query_uuid } = payload;

  return bffClient.get(`/queries/${query_uuid}`, {
    headers: {
      org_uuid,
    },
  });
};
