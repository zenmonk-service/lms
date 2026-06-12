export interface ListNotificationsPayload {
  org_uuid: string;
  user_uuid: string;
  params?: {
    page: number;
    limit: number;
    is_read?: boolean;
    search?: string;
  }
}
