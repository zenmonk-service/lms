import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RecommendLeaveRequestPayload } from "./recommend-leave-request.types";
import { recommendLeaveRequest } from "./recommend-leave-request.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const recommendLeaveRequestAction = createAsyncThunk(
  LeaveActionType.RECOMMEND_LEAVE_REQUEST,
  async (payload: RecommendLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await recommendLeaveRequest(payload);
      toastSuccess("Recommended successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
