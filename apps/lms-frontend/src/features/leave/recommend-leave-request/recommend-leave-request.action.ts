import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RecommendLeaveRequestPayload } from "./recommend-leave-request.types";
import { recommendLeaveRequest } from "./recommend-leave-request.service";
import { LeaveActionType } from "../leave.types";

export const recommendLeaveRequestAction = createAsyncThunk(
  LeaveActionType.RECOMMEND_LEAVE_REQUEST,
  async (payload: RecommendLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await recommendLeaveRequest(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error.message || "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
