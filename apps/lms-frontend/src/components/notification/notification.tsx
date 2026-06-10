import useWebSocket from "@/hooks/use-websocket";
import { getUserNotifications } from "@/features/notifications/notifications.service";
import { persistor, useAppSelector } from "@/store";
import React, { useEffect, useMemo, useState } from "react";
import { Bell, Dot, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { signOutUser } from "@/app/auth/sign-out.action";

type NotificationItem = {
  id: string;
  message: string;
  is_read: boolean;
  type: "leave" | "event" | "general";
  uuid?: string;
  sendTo?: string | string[];
  createdAt?: string;
};
interface LiveNotification {
  send_to: string | string[];
  content: {
    type: "leave" | "event" | "general" | "inactive_user";
    uuid?: string;
    text: string;
  };
}
interface INotification {
  is_read: boolean;
  id: number | string;
  message: LiveNotification;
  created_at: string;
}

const parseNotification = (
  raw: string,
  idx: number,
): NotificationItem | undefined => {
  let parsed: unknown;
  parsed = JSON.parse(raw);

  const data = parsed as LiveNotification;
  const message =
    typeof data.content.text === "string" && data.content.text.trim().length > 0
      ? data.content.text.trim()
      : "New notification";

  return {
    id: `${idx}-${message}`,
    message: message,
    is_read: false,
    type: data.content.type as "leave" | "event" | "general",
    uuid: data.content.uuid as string | undefined,
    sendTo:
      Array.isArray(data.send_to) || typeof data.send_to === "string"
        ? (data.send_to as string | string[])
        : undefined,
  };
};

const parseStoredNotification = (
  notification: INotification,
  idx: number,
): NotificationItem => {
  const message = notification.message.content.text;

  return {
    id:
      typeof notification.id === "number" || typeof notification.id === "string"
        ? String(notification.id)
        : `stored-${idx}-${message}`,
    is_read: notification.is_read,
    message: message,
    type: notification.message.content.type as "leave" | "event" | "general",
    uuid: notification.message.content.uuid as string | undefined,
    sendTo:
      Array.isArray(notification.message.send_to) ||
      typeof notification.message.send_to === "string"
        ? (notification.message.send_to as string | string[])
        : undefined,
    createdAt: notification.created_at,
  };
};

const formatTimestamp = (value?: string) => {
  const date = new Date(value || Date.now());

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Notification() {
  const router = useRouter();
  const { messages, sendMessage, isConnected } = useWebSocket(
    "ws://localhost:8083",
  );
  const { currentOrganization } = useAppSelector(
    (state) => state.organizationsSlice,
  );
  const currentUser = useAppSelector((state) => state.userSlice.currentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [storedNotifications, setStoredNotifications] = useState<
    NotificationItem[]
  >([]);

  useEffect(() => {
    if (!currentOrganization?.uuid || !currentUser?.user_id) return;

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await getUserNotifications(
          currentOrganization.uuid,
          currentUser.user_id,
        );
        const rows = Array.isArray(response.data?.rows)
          ? response.data.rows
          : [];

        if (isMounted) {
          setStoredNotifications(
            rows.map((item: INotification, idx: number) =>
              parseStoredNotification(item, idx),
            ),
          );
        }
      } catch (error) {
        if (isMounted) {
          setStoredNotifications([]);
        }
      }
    };

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, [currentOrganization?.uuid, currentUser?.user_id]);

  function MarkNotification(notification_uuid: string) {
    sendMessage(
      JSON.stringify({
        action: "mark_notification",
        organization: currentOrganization.uuid,
        notification_uuid: notification_uuid,
      }),
    );
  }

  useEffect(() => {
    if (!isConnected || !currentOrganization?.uuid || !currentUser?.user_id)
      return;

    sendMessage(
      JSON.stringify({
        action: "subscribe",
        organization: currentOrganization.uuid,
        user_uuid: currentUser.user_id,
      }),
    );

    return () => {
      sendMessage(
        JSON.stringify({
          action: "unsubscribe",
          organization: currentOrganization.uuid,
        }),
      );
    };
  }, [
    isConnected,
    currentOrganization?.uuid,
    currentUser?.user_id,
    sendMessage,
  ]);

  const handleClick = (type: "event" | "leave" | "general", uuid?: string) => {
    if (type === "leave" && uuid) {
      router.push(`/${currentOrganization?.uuid}/approvals?uuid=${uuid}`);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const hasInactiveUserNotification = messages.some((message) => {
      try {
        const parsed = JSON.parse(message) as LiveNotification;
        return parsed.content.type === "inactive_user";
      } catch {
        return false;
      }
    });

    if (hasInactiveUserNotification) {
      const handleLogout = async () => {
        await signOutUser();
        await persistor.purge();
        router.replace("/login");
      };
      handleLogout();
    }
  }, [messages, router]);

  const notificationItems = useMemo(() => {
    const liveNotifications = messages
      .map((message, idx) => parseNotification(message, idx))
      .filter((item): item is NotificationItem => item !== undefined)
      .reverse();
    return [...liveNotifications, ...storedNotifications].slice(0, 50);
  }, [messages, storedNotifications]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle notifications"
        >
          <Bell className="size-5" />
          {notificationItems.length > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {notificationItems.length > 99 ? "99+" : notificationItems.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-90 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-sm font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">
              {isConnected ? "Live updates" : "Disconnected"}
            </p>
          </div>
          <Badge variant={isConnected ? "success" : "secondary"}>
            {isConnected ? "Online" : "Offline"}
          </Badge>
        </div>
        <div className="max-h-90 overflow-y-auto">
          {notificationItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col">
              {notificationItems.map((message) => (
                <div
                  key={message.id}
                  className="overflow-hidden border-b last:border-b-0 last:rounded-bl-md last:rounded-br-md"
                  onClick={() => MarkNotification(message.id)}
                >
                  <div
                    className="flex gap-2 px-4 py-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleClick(message.type, message.uuid)}
                  >
                    {!message.is_read && (
                      <div className="bg-primary/10 rounded-full h-fit">
                        <Dot className="size-4 text-primary" strokeWidth={10} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium leading-none tracking-tight">
                        {message.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(message.createdAt)}
                      </p>
                    </div>
                    {message.type === "leave" && (
                      <ExternalLink className="size-3.5 ml-auto" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
