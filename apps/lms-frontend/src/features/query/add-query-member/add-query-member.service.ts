import { bffClient } from "@/config/client";
import { AddQueryMemberPayload } from "./add-query-member.types";

export const addQueryMember = (payload: AddQueryMemberPayload) => {
  const { org_uuid, query_uuid, data } = payload;

  return bffClient.post(`/queries/${query_uuid}/members`, data, {
    headers: {
      org_uuid,
    },
  });
};
