import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { forgotPassword } from "./forgot-password.service";

export const ForgotPasswordAction = createAsyncThunk(
  UserActionType.FORGOT_PASSWORD,
  async (email: string, thunkAPI) => {
    try {
      const response = await forgotPassword(email);
      return await response.json();
    } catch (err: any) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
