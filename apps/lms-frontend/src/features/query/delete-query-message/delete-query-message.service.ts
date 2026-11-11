import { bffClient } from "@/config/client";
import { DeleteQueryMessagePayload } from "./delete-query-message.types";

export const deleteQueryMessage = (payload: DeleteQueryMessagePayload) => {
  const { org_uuid, query_uuid, message_uuid } = payload;

  return bffClient.delete(`/queries/${query_uuid}/messages/${message_uuid}`, {
    headers: {
      org_uuid,
    },
  });
};
