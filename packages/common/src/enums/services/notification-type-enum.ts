import { ENUM } from "../enum";

export class NotificationType extends ENUM {
  static ENUM = {
    LEAVE: "leave",
    GENERAL: "general",
    EVENT: "event",
    INACTIVE_USER: "inactive_user",
    CONFORMATION: "conformation",
  } as const;
}

export type NotificationTypeType =
  (typeof NotificationType.ENUM)[keyof typeof NotificationType.ENUM];
