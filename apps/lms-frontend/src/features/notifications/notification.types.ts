export enum NotificationType {
    LIST_NOTIFICATIONS = "notifications/list",
    GET_UNREAD_NOTIFICATION_COUNT = "notifications/unread-count",
}

export enum NotificationType {
    LEAVE = "leave",
    EVENT = "event",
    GENERAL = "general",
    INACTIVE_USER = "inactive_user",
}

export interface Notification {
    id: number;
    message: {
        send_to: string;
        content: {
            type: NotificationType;
            uuid?: string;
            text: string;
        } 
    }
    user_id: number;
    is_read: boolean;
    created_at: string;
}

export interface Notifications {
    rows: Notification[];
    page: number;
    limit: number;
    total: number;
    count: number;
}

export interface NotificationState {
    isLoading: boolean;
    isLoadingUnreadCount: boolean;

    notifications: Notifications;
    unread_count: number;
}