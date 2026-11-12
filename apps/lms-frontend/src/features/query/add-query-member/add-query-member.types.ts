export interface AddQueryMemberPayload {
  org_uuid: string;
  query_uuid: string;
  data: {
    /** Users to add (their `user_id` uuid). Yourself and existing members are rejected/skipped. */
    user_uuids: string[];
    role?: string;
  };
}
