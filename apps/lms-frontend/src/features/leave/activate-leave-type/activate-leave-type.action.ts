import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActivateLeaveTypePayload } from "./activate-leave-type.types";
import { activateLeaveType } from "./activate-leave-type.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const activateLeaveTypeAction = createAsyncThunk(
  LeaveActionType.ACTIVATE_LEAVE_TYPE,
  async (payload: ActivateLeaveTypePayload, thunkAPI) => {
    try {
      const response = await activateLeaveType(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
