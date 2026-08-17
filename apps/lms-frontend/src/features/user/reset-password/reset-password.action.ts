import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { resetPassword } from "./reset-password.service";

export const resetPasswordAction = createAsyncThunk(
  UserActionType.RESET_PASSWORD,
  async (payload: ResetPasswordPayload, thunkAPI) => {
    try {
      const response = await resetPassword(payload);
      toastSuccess("Password reset successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
