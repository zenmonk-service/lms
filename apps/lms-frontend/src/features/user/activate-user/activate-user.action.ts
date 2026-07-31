import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserActionType } from "../user.type";
import { activateUser } from "./activate.user.service";
import { ActiveUserActionType } from "./activate-user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const activateUserAction = createAsyncThunk(
  UserActionType.ACTIVATE_USER,
  async (payload: ActiveUserActionType, thunkAPI) => {
    try {
      const response = await activateUser(payload);
      toastSuccess("User activated successfully");
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
