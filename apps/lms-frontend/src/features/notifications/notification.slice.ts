import { createSlice } from "@reduxjs/toolkit";
import { listNotificationsAction } from "./list-notifications/list-notifications.action";
import { NotificationState } from "./notification.types";
import { getUserUnreadNotificationCountAction } from "./get-user-unread-notification-count/get-user-unread-notification-count.action";


const initialState: NotificationState = {
  isLoading: false,
  isLoadingUnreadCount: false,
  unread_count: 0,
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(listNotificationsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(listNotificationsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications.rows = [
          ...state.notifications.rows,
          ...action.payload.rows,
        ];
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
      .addCase(getUserUnreadNotificationCountAction.fulfilled, (state, action) => {
        state.isLoadingUnreadCount = false;
        state.unread_count = action.payload.unread_count;
      })
      .addCase(getUserUnreadNotificationCountAction.rejected, (state) => {
        state.isLoadingUnreadCount = false;
      });
  },
});

export const { resetNotifications } = notificationSlice.actions;
export const notificationReducer = notificationSlice.reducer;