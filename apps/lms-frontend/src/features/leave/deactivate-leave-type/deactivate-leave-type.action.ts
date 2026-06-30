import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeactivateLeaveTypePayload } from "./deactivate-leave-type.types";
import { deactivateLeaveType } from "./deactivate-leave-type.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const deactivateLeaveTypeAction = createAsyncThunk(
  LeaveActionType.DEACTIVATE_LEAVE_TYPE,
  async (payload: DeactivateLeaveTypePayload, thunkAPI) => {
    try {
      const response = await deactivateLeaveType(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
