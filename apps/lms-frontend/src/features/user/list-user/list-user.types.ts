export interface ListUserPayload {
  pagination: { page: number; limit?: number; search?: string };
  org_uuid: string;
  isCurrentUser?: boolean;
  isInfiniteScroll?: boolean;
  month?: string;
}
