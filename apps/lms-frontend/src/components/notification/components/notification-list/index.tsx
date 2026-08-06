import {
  Notifications,
  NotificationType,
} from "@/features/notifications/notification.types";
import { Dot, ExternalLink, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import NotificationListSkeleton from "./skeleton";
import { Button } from "@/components/ui/button";
import InfiniteScroll from "react-infinite-scroll-component";
import { useAppSelector } from "@/store";

interface IProps {
  org_uuid: string;
  notifications: Notifications;
  handleClose: () => void;
  isLoading: boolean;
  fetchMore: () => void;
  handleMarkAsRead: (uuid: number) => void;
  refreshNotifications: () => void;
}

const NotificationList = ({
  org_uuid,
  notifications,
  handleClose,
  isLoading,
  fetchMore,
  handleMarkAsRead,
  refreshNotifications,
}: IProps) => {
  const router = useRouter();
  const hasMore = notifications.rows.length < notifications.total;
  const { new_count } = useAppSelector((state) => state.notificationSlice);

  const formatTimestamp = (value?: string) => {
    const date = new Date(value || Date.now());
    return date.toLocaleString([], {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleClick = (type: NotificationType, user_uuid?: string) => {
    if (type === NotificationType.LEAVE && user_uuid) {
      router.push(`/${org_uuid}/approvals?uuid=${user_uuid}`);
      handleClose();
    }
  };

  if (isLoading && notifications.rows.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <NotificationListSkeleton />
      </div>
    );
  }

  return (
    <div
      id="notification-scroll-container"
      className="flex-1 overflow-y-auto no-scrollbar"
    >
      <InfiniteScroll
        dataLength={notifications.rows.length}
        next={fetchMore}
        hasMore={hasMore}
        loader={
          isLoading ? (
            <div className="flex justify-center py-3">
              <LoaderCircle className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : null
        }
        scrollableTarget="notification-scroll-container"
        style={{ overflow: "visible" }}
      >
        <div className="flex flex-col">
          {new_count > 0 && (
            <button
              onClick={refreshNotifications}
              className="sticky top-0 z-10 w-full border-b bg-primary/5 px-4 py-3 transition-colors hover:bg-primary/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Dot className="h-6 w-6 text-primary" strokeWidth={8} />
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">
                      {new_count} new notification{new_count > 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Tap to load the latest updates
                    </p>
                  </div>
                </div>

                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          )}
          {!isLoading && notifications.rows.length === 0
            ? new_count === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">
                    No notifications yet.
                  </p>
                </div>
              )
            : notifications.rows.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 border-b relative transition-colors cursor-pointer ${
                    !msg.is_read && "bg-muted/60 hover:bg-muted"
                  }`}
                  onClick={() =>
                    handleClick(
                      msg.message.content.type,
                      msg.message.content.uuid,
                    )
                  }
                >
                  <div className="flex items-start">
                    <p className="text-sm text-balance flex-1">
                      {msg.message.content.text}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {msg.message.content.type === NotificationType.LEAVE && (
                        <ExternalLink className="size-4 text-muted-foreground" />
                      )}
                      {!msg.is_read && (
                        <Dot strokeWidth={7} className="text-primary h-fit" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center mt-1">
                    <p className="text-xs text-muted-foreground mr-auto">
                      {formatTimestamp(msg.created_at)}
                    </p>
                    {!msg.is_read && (
                      <Button
                        variant="link"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(msg.id);
                        }}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default NotificationList;
