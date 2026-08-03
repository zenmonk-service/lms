import { GetUserUnreadNotificationCountPayload } from "./get-user-unread-notification-count.types";
import { bffClient } from "@/config/client";

export const getUserUnreadNotificationCount = (payload: GetUserUnreadNotificationCountPayload) => {
  const { org_uuid, user_uuid } = payload;
  return bffClient.get(`/users/${user_uuid}/notifications/unread-count`, {
    headers: {
      org_uuid,
    },
  });
};
