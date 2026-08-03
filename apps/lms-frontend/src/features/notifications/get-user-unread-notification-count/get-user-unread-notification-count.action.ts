import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { NotificationType } from "../notification.types";
import { GetUserUnreadNotificationCountPayload } from "./get-user-unread-notification-count.types";
import { getUserUnreadNotificationCount } from "./get-user-unread-notification-count.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getUserUnreadNotificationCountAction = createAsyncThunk(
  NotificationType.GET_UNREAD_NOTIFICATION_COUNT,
  async (payload: GetUserUnreadNotificationCountPayload, thunkAPI) => {
    try {
      const response = await getUserUnreadNotificationCount(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
