export interface listUserPayload {
  pagination: { page: number; limit?: number; search?: string };
  org_uuid: string;
  isCurrentUser?: boolean;
  isInfiniteScroll?: boolean;
}
