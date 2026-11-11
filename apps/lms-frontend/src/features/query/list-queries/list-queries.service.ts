import { bffClient } from "@/config/client";
import { ListQueriesPayload } from "./list-queries.types";

export const listQueries = (payload: ListQueriesPayload) => {
  const { org_uuid, params } = payload;

  return bffClient.get("/queries", {
    params,
    headers: {
      org_uuid,
    },
  });
};
