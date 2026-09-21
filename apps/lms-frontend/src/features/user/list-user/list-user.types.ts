export interface ListUserPayload {
  pagination: { page: number; limit?: number; search?: string };
  org_uuid: string;
  isCurrentUser?: boolean;
  isInfiniteScroll?: boolean;
  month?: string;
  managers_required?: boolean;
  is_active?: boolean;
  is_me: string;
  is_filter: string;
}
