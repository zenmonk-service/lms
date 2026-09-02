import { createSlice } from "@reduxjs/toolkit";
import { listNotificationsAction } from "./list-notifications/list-notifications.action";
import { Notification, NotificationState } from "./notification.types";
import { getUserUnreadNotificationCountAction } from "./get-user-unread-notification-count/get-user-unread-notification-count.action";

const initialState: NotificationState = {
  isLoading: false,
  isLoadingUnreadCount: false,
  unread_count: 0,
  new_count: 0,
  notifications: {
    rows: [],
    page: 1,
    limit: 10,
    total: 0,
    count: 0,
  },
};

export const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    resetNotifications: (state) => {
      state.notifications = initialState.notifications;
    },
    markNotificationAsRead: (state, action) => {
      const { id } = action.payload;
      if (action.payload.tab !== "unread") {
        state.notifications.rows = state.notifications.rows.map(
          (notification) =>
            notification.id === id
              ? { ...notification, is_read: true }
              : notification,
        );
      } else {
        state.notifications.rows = state.notifications.rows.filter(
          (notification) => notification.id !== id,
        );
      }
      state.unread_count = Math.max(state.unread_count - 1, 0);
    },

    markAllNotificationAsRead: (state, action) => {
      if (action.payload.tab === "unread") {
        state.notifications.rows = [];
      } else {
        state.notifications.rows = state.notifications.rows.map(
          (notification) => {
            return { ...notification, is_read: true };
          },
        );
      }
      state.unread_count = 0;
    },
    incrementUnreadCount: (state) => {
      state.unread_count += 1;
    },
    incrementNewCount: (state) => {
      state.new_count += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listNotificationsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(listNotificationsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.page === 1) {
          state.notifications.rows = action.payload.rows;
          state.new_count = 0;
        } else {
          const uniqueRows = action.payload.rows.filter(
            (newNotification: Notification) =>
              !state.notifications.rows.some(
                (existingNotification) =>
                  existingNotification.id === newNotification.id,
              ),
          );
          state.notifications.rows = [
            ...state.notifications.rows,
            ...uniqueRows,
          ];
        }
        state.notifications.page = action.payload.page;
        state.notifications.total = action.payload.total;
        state.notifications.count = state.notifications.rows.length;
        state.notifications.limit = action.payload.limit;
      })
      .addCase(listNotificationsAction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(getUserUnreadNotificationCountAction.pending, (state) => {
        state.isLoadingUnreadCount = true;
      })
      .addCase(
        getUserUnreadNotificationCountAction.fulfilled,
        (state, action) => {
          state.isLoadingUnreadCount = false;
          state.unread_count = action.payload.unread_count;
        },
      )
      .addCase(getUserUnreadNotificationCountAction.rejected, (state) => {
        state.isLoadingUnreadCount = false;
      });
  },
});

export const {
  resetNotifications,
  markNotificationAsRead,
  markAllNotificationAsRead,
  incrementUnreadCount,
  incrementNewCount,
} = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;
