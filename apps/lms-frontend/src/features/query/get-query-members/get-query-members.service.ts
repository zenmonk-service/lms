import { bffClient } from "@/config/client";
import { GetQueryMembersPayload } from "./get-query-members.types";

export const getQueryMembers = (payload: GetQueryMembersPayload) => {
  const { org_uuid, query_uuid } = payload;

  return bffClient.get(`/queries/${query_uuid}/members`, {
    headers: {
      org_uuid,
    },
  });
};
