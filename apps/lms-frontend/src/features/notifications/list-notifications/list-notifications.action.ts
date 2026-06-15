import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { NotificationType } from "../notification.types";
import { ListNotificationsPayload } from "./list-notifications.types";
import { listNotifications } from "./list-notifications.service";

export const listNotificationsAction = createAsyncThunk(
  NotificationType.LIST_NOTIFICATIONS,
  async (payload: ListNotificationsPayload, thunkAPI) => {
    try {
      const response = await listNotifications(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
