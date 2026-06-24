import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApproveLeaveRequestPayload } from "./approve-leave-request.types";
import { approveLeaveRequest } from "./approve-leave-request.service";
import { LeaveActionType } from "../leave.types";

export const approveLeaveRequestAction = createAsyncThunk(
  LeaveActionType.APPROVE_LEAVE_REQUEST,
  async (payload: ApproveLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await approveLeaveRequest(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
