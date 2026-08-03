import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActivateLeaveTypePayload } from "./activate-leave-type.types";
import { activateLeaveType } from "./activate-leave-type.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const activateLeaveTypeAction = createAsyncThunk(
  LeaveActionType.ACTIVATE_LEAVE_TYPE,
  async (payload: ActivateLeaveTypePayload, thunkAPI) => {
    try {
      const response = await activateLeaveType(payload);
      toastSuccess("Leave successfully activated!");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
