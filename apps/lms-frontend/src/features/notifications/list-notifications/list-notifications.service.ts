import { ListNotificationsPayload } from "./list-notifications.types";
import { bffClient } from "@/config/client";

export const listNotifications = (payload: ListNotificationsPayload) => {
  const { org_uuid, user_uuid, params } = payload;
  return bffClient.get(`/users/${user_uuid}/notifications`, {
    params,
    headers: {
      org_uuid,
    },
  });
};
