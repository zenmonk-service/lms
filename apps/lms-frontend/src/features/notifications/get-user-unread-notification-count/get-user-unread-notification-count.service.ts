import axiosInterceptorInstance from "@/config/axios";
import { GetUserUnreadNotificationCountPayload } from "./get-user-unread-notification-count.types";

export const getUserUnreadNotificationCount = (payload: GetUserUnreadNotificationCountPayload) => {
  const { org_uuid, user_uuid } = payload;
  return axiosInterceptorInstance.get(`/users/${user_uuid}/notifications/unread-count`, {
    headers: {
      org_uuid,
    },
  });
};
