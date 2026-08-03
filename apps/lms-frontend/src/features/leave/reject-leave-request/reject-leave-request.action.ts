import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RejectLeaveRequestPayload } from "./reject-leave-request.types";
import { rejectLeaveRequest } from "./reject-leave-request.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const rejectLeaveRequestAction = createAsyncThunk(
  LeaveActionType.REJECT_LEAVE_REQUEST,
  async (payload: RejectLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await rejectLeaveRequest(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
