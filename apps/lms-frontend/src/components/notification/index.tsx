import useWebSocket from "@/hooks/use-websocket";
import { useAppDispatch, useAppSelector } from "@/store";
import React, { useEffect, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Separator } from "../ui/separator";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import NotificationList from "./components/notification-list";
import { listNotificationsAction } from "@/features/notifications/list-notifications/list-notifications.action";
import { resetNotifications } from "@/features/notifications/notification.slice";
import { getUserUnreadNotificationCountAction } from "@/features/notifications/get-user-unread-notification-count/get-user-unread-notification-count.action";

export default function Notification() {
  const { messages, sendMessage, isConnected } = useWebSocket("ws://localhost:8083");

  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((state) => state.userSlice.currentUser);
  const { notifications, isLoading, unread_count, isLoadingUnreadCount } = useAppSelector((state) => state.notificationSlice);
  const { currentOrganization } = useAppSelector((state) => state.organizationsSlice);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [tab, setTab] = useState<"all" | "unread">("all");

  const handleOpen = (open: boolean) => {
    setOpenDrawer(open);

    if (open) {
      setTab("all");
      dispatch(resetNotifications());
      dispatch(
        listNotificationsAction({
          org_uuid: currentOrganization?.uuid,
          user_uuid: currentUser?.user_id,
          params: { page: 1, limit: 10 },
        }),
      );
    }
  };

  const handleTabChange = (value: "all" | "unread") => {
    setTab(value);
    dispatch(resetNotifications());
    dispatch(
      listNotificationsAction({
        org_uuid: currentOrganization?.uuid,
        user_uuid: currentUser?.user_id,
        params: {
          page: 1,
          limit: 10,
          is_read: value === "unread" ? false : undefined,
        },
      }),
    );
  };

  const handleFetchMore = () => {
    dispatch(
      listNotificationsAction({
        org_uuid: currentOrganization?.uuid,
        user_uuid: currentUser?.user_id,
        params: {
          page: notifications.page + 1,
          limit: notifications.limit,
          is_read: tab === "unread" ? false : undefined,
        },
      }),
    );
  };

  const handleClose = () => setOpenDrawer(false);

  const handleMarkAllAsRead = () => {
    sendMessage(
      JSON.stringify({
        action: "mark_all_notification",
        organization: currentOrganization.uuid,
        user_uuid: currentUser.user_id,
      }),
    );
  };

  const handleMarkAsRead = (notification_uuid: number) => {
    sendMessage(
      JSON.stringify({
        action: "mark_notification",
        organization: currentOrganization.uuid,
        notification_uuid: notification_uuid,
      }),
    );
  };

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
  }, [isConnected, currentOrganization?.uuid, currentUser?.user_id, sendMessage]);

  useEffect(() => {
    dispatch(
      getUserUnreadNotificationCountAction({
        org_uuid: currentOrganization?.uuid,
        user_uuid: currentUser?.user_id,
      })
    );
  }, []);

  return (
    <Drawer direction="right" open={openDrawer} onOpenChange={handleOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Toggle notifications"
        >
          <Bell className="size-5" />
          {unread_count > 0 && (
            <Badge
              variant="default"
              className="z-10 absolute -right-1 -top-1 w-5 h-5 rounded-full leading-none text-[11px]"
            >
              {unread_count > 99
                ? "99+"
                : unread_count}
            </Badge>
          )}
        </Button>
      </DrawerTrigger>

      <DrawerContent className="min-w-lg">
        <DrawerHeader className="bg-muted/60">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <DrawerTitle className="font-semibold">All Notifications</DrawerTitle>
            <DrawerClose asChild className="ml-auto">
              <Button variant="ghost" size={"icon-sm"}>
                <X />
              </Button>
            </DrawerClose>
          </div>
          <DrawerDescription className="text-xs">
            Review all alerts received on this workspace
          </DrawerDescription>
        </DrawerHeader>

        <Separator />

        <div className="flex items-center justify-between px-4 pt-1 border-b">
          <Tabs
            value={tab}
            onValueChange={(value) => handleTabChange(value as "all" | "unread")}
          >
            <TabsList variant="line">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">
                Unread{" "}
                {unread_count > 0 && (
                  <Badge
                    variant="default"
                    className="w-5 h-5 rounded-full text-[11px] leading-none"
                  >
                    {unread_count}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="link" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCheck />
            Mark all as read
          </Button>
        </div>

        <NotificationList
          org_uuid={currentOrganization?.uuid}
          notifications={notifications}
          handleClose={handleClose}
          isLoading={isLoading}
          fetchMore={handleFetchMore}
          handleMarkAsRead={handleMarkAsRead}
        />
      </DrawerContent>
    </Drawer>
  );
}