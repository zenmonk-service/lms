import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { UpdateLeaveTypePayload } from "./update-leave-type.types";
import { updateLeaveType } from "./update-leave-type.service";

export const updateLeaveTypeAction = createAsyncThunk(
  LeaveActionType.UPDATE_LEAVE_TYPE,
  async (payload: UpdateLeaveTypePayload, thunkAPI) => {
    try {
      const response = await updateLeaveType(payload);
      toastSuccess("Leave type successfully updated!");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
