import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserActionType } from "../user.type";
import { DeactivateUserActionType } from "./deactivate-user.type";
import { deactivateUser } from "./deactivate-user.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const deactivateUserAction = createAsyncThunk(
  UserActionType.DEACTIVATE_USER,
  async (payload: DeactivateUserActionType, thunkAPI) => {
    try {
      const response = await deactivateUser(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
