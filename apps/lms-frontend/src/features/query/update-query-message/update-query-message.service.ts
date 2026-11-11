import { bffClient } from "@/config/client";
import { UpdateQueryMessagePayload } from "./update-query-message.types";

export const updateQueryMessage = (payload: UpdateQueryMessagePayload) => {
  const { org_uuid, query_uuid, message_uuid, data } = payload;

  return bffClient.patch(`/queries/${query_uuid}/messages/${message_uuid}`, data, {
    headers: {
      org_uuid,
    },
  });
};
