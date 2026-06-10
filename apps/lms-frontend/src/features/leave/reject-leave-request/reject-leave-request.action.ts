import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RejectLeaveRequestPayload } from "./reject-leave-request.types";
import { rejectLeaveRequest } from "./reject-leave-request.service";
import { LeaveActionType } from "../leave.types";

export const rejectLeaveRequestAction = createAsyncThunk(
  LeaveActionType.REJECT_LEAVE_REQUEST,
  async (payload: RejectLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await rejectLeaveRequest(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
