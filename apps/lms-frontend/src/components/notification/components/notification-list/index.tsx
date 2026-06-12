import {
  Notifications,
  NotificationType,
} from "@/features/notifications/notification.types";
import { Dot, ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import NotificationListSkeleton from "./skeleton";
import { Button } from "@/components/ui/button";
import InfiniteScroll from "react-infinite-scroll-component";

interface IProps {
  org_uuid: string;
  notifications: Notifications;
  handleClose: () => void;
  isLoading: boolean;
  fetchMore: () => void;
  handleMarkAsRead: (uuid: number) => void;
}

const NotificationList = ({
  org_uuid,
  notifications,
  handleClose,
  isLoading,
  fetchMore,
  handleMarkAsRead,
}: IProps) => {
  const router = useRouter();

  const hasMore = notifications.rows.length < notifications.total;

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

  if (!isLoading && notifications.rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
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
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            </div>
          ) : null
        }
        scrollableTarget="notification-scroll-container"
        style={{ overflow: "visible" }}
      >
        <div className="flex flex-col">
          {notifications.rows.map((msg) => (
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
              </div>
            </div>
          ))}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default NotificationList;