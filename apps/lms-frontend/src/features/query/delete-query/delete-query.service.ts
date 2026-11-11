import { bffClient } from "@/config/client";
import { DeleteQueryPayload } from "./delete-query.types";

export const deleteQuery = (payload: DeleteQueryPayload) => {
  const { org_uuid, query_uuid } = payload;

  return bffClient.delete(`/queries/${query_uuid}`, {
    headers: {
      org_uuid,
    },
  });
};
