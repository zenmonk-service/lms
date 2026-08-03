import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserActionType } from "../user.type";
import { DeactivateUserActionType } from "./deactivate-user.type";
import { deactivateUser } from "./deactivate-user.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const deactivateUserAction = createAsyncThunk(
  UserActionType.DEACTIVATE_USER,
  async (payload: DeactivateUserActionType, thunkAPI) => {
    try {
      const response = await deactivateUser(payload);
      toastSuccess("User deactivated successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
