import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListLeaveTypesPayload } from "./list-leave-types.types";
import { listLeaveTypes } from "./list-leave-types.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listLeaveTypesAction = createAsyncThunk(
  LeaveActionType.LIST_LEAVE_TYPES,
  async (payload: ListLeaveTypesPayload, thunkAPI) => {
    try {
      const response = await listLeaveTypes(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
