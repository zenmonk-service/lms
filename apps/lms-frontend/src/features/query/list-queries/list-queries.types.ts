export interface ListQueriesParams extends Record<
  string,
  string | number | boolean | undefined | null | object
> {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  module?: string;
  search?: string;
  archive?: boolean;
  only_my_queries?: boolean;
  isInfiniteScroll?: boolean;
}

export interface ListQueriesPayload {
  org_uuid: string;
  params?: ListQueriesParams;
}
