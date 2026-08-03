import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { UserActionType } from "../user.type";
import { ListUserLeaveTypesPayload } from "./list-user-leave-types.types";
import { listLeaveTypesService } from "./list-user-leave-types.service";

export const listUserLeaveTypesAction = createAsyncThunk(
  UserActionType.LIST_USER_LEAVE_TYPES,
  async (payload: ListUserLeaveTypesPayload, thunkAPI) => {
    try {
      const response = await listLeaveTypesService(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
