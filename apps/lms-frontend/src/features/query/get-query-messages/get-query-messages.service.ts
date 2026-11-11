import { bffClient } from "@/config/client";
import { GetQueryMessagesPayload } from "./get-query-messages.types";

export const getQueryMessages = (payload: GetQueryMessagesPayload) => {
  const { org_uuid, query_uuid, params } = payload;

  return bffClient.get(`/queries/${query_uuid}/messages`, {
    params,
    headers: {
      org_uuid,
    },
  });
};
