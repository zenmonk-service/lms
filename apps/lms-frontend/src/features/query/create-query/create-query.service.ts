import { bffClient } from "@/config/client";
import { CreateQueryPayload } from "./create-query.types";

export const createQuery = (payload: CreateQueryPayload) => {
  const { org_uuid, data } = payload;

  return bffClient.post("/queries", data, {
    headers: {
      org_uuid,
    },
  });
};
