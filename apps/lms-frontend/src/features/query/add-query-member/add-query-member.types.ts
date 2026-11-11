export interface AddQueryMemberPayload {
  org_uuid: string;
  query_uuid: string;
  data: {
    user_uuid?: string;
    user_id?: string | number;
    role?: string;
  };
}
