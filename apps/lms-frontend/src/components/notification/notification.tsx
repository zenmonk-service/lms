import useWebSocket from "@/hooks/use-websocket";
import { getUserNotifications } from "@/features/notifications/notifications.service";
import { useAppSelector } from "@/store";
import { useEffect, useMemo, useState } from "react";
import { Bell, Dot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

type NotificationItem = {
  id: string;
  message: string;
  sendTo?: string | string[];
  createdAt?: string;
};

const clamp = (value: string, max = 180) =>
  value.length > max ? `${value.slice(0, max)}...` : value;

const parseNotification = (raw: string, idx: number): NotificationItem => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      id: `${idx}-${raw}`,
      message: clamp(raw),
    };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      id: `${idx}-${raw}`,
      message: clamp(String(parsed)),
    };
  }

  const data = parsed as Record<string, unknown>;
  const message =
    typeof data.message === "string" && data.message.trim().length > 0
      ? data.message.trim()
      : "New notification";

  return {
    id: `${idx}-${message}`,
    message: clamp(message),
    sendTo: Array.isArray(data.send_to) || typeof data.send_to === "string"
      ? (data.send_to as string | string[])
      : undefined,
  };
};

const parseStoredNotification = (
  notification: Record<string, unknown>,
  idx: number,
): NotificationItem => {
  const rawMessage = notification.message;
  const data =
    rawMessage && typeof rawMessage === "object" && !Array.isArray(rawMessage)
      ? (rawMessage as Record<string, unknown>)
      : {};
  const message =
    typeof data.message === "string" && data.message.trim().length > 0
      ? data.message.trim()
      : "New notification";

  return {
    id:
      typeof notification.id === "number" || typeof notification.id === "string"
        ? String(notification.id)
        : `stored-${idx}-${message}`,
    message: clamp(message),
    sendTo:
      Array.isArray(data.send_to) || typeof data.send_to === "string"
        ? (data.send_to as string | string[])
        : undefined,
    createdAt:
      typeof notification.created_at === "string"
        ? notification.created_at
        : undefined,
  };
};

const formatTimestamp = (value?: string) => {
  if (!value) return "Live update";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Live update";

  return date.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function Notification() {
  const { messages, sendMessage, isConnected } = useWebSocket(
    "ws://localhost:8083",
  );
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);
  const currentUser = useAppSelector((state) => state.userSlice.currentUser);
  const [isOpen, setIsOpen] = useState(false);
  const [storedNotifications, setStoredNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!currentOrganization?.uuid || !currentUser?.user_id) return;

    let isMounted = true;

    const loadNotifications = async () => {
      try {
        const response = await getUserNotifications(
          currentOrganization.uuid,
          currentUser.user_id,
        );
        const rows = Array.isArray(response.data?.rows) ? response.data.rows : [];

        if (isMounted) {
          setStoredNotifications(
            rows.map((item: Record<string, unknown>, idx: number) =>
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

  useEffect(() => {
    if (!isConnected || !currentOrganization?.uuid || !currentUser?.user_id) return;

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
  }, [isConnected, currentOrganization?.uuid, currentUser?.user_id, sendMessage]);

  const notificationItems = useMemo(() => {
    const liveNotifications = messages
      .map((message, idx) => parseNotification(message, idx))
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
      <PopoverContent align="end" className="w-[360px] p-0">
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
        <div className="max-h-[360px] overflow-y-auto px-4 py-3">
          {notificationItems.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {notificationItems.map((message) => (
                <div
                  key={message.id}
                  className="rounded-xl border bg-card p-3 shadow-xs"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 rounded-full bg-primary/10 p-1 text-primary">
                      <Dot className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-5">
                        {message.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTimestamp(message.createdAt)}
                      </p>
                    </div>
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
