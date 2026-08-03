import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApproveLeaveRequestPayload } from "./approve-leave-request.types";
import { approveLeaveRequest } from "./approve-leave-request.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const approveLeaveRequestAction = createAsyncThunk(
  LeaveActionType.APPROVE_LEAVE_REQUEST,
  async (payload: ApproveLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await approveLeaveRequest(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
