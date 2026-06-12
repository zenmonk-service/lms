import axiosInterceptorInstance from "@/config/axios";
import { ListNotificationsPayload } from "./list-notifications.types";

export const listNotifications = (payload: ListNotificationsPayload) => {
  const { org_uuid, user_uuid, params } = payload;
  return axiosInterceptorInstance.get(`/users/${user_uuid}/notifications`, {
    params,
    headers: {
      org_uuid,
    },
  });
};
