import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { NotificationType } from "../notification.types";
import { GetUserUnreadNotificationCountPayload } from "./get-user-unread-notification-count.types";
import { getUserUnreadNotificationCount } from "./get-user-unread-notification-count.service";

export const getUserUnreadNotificationCountAction = createAsyncThunk(
  NotificationType.GET_UNREAD_NOTIFICATION_COUNT,
  async (payload: GetUserUnreadNotificationCountPayload, thunkAPI) => {
    try {
      const response = await getUserUnreadNotificationCount(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
