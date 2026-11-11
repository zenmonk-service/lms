import { bffClient } from "@/config/client";
import { CreateQueryMessagePayload } from "./create-query-message.types";

export const createQueryMessage = (payload: CreateQueryMessagePayload) => {
  const { org_uuid, query_uuid, data } = payload;

  return bffClient.post(`/queries/${query_uuid}/messages`, data, {
    headers: {
      org_uuid,
    },
  });
};
