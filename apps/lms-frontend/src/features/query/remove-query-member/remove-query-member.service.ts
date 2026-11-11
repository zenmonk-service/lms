import { bffClient } from "@/config/client";
import { RemoveQueryMemberPayload } from "./remove-query-member.types";

export const removeQueryMember = (payload: RemoveQueryMemberPayload) => {
  const { org_uuid, query_uuid, member_uuid } = payload;

  return bffClient.delete(`/queries/${query_uuid}/members/${member_uuid}`, {
    headers: {
      org_uuid,
    },
  });
};
