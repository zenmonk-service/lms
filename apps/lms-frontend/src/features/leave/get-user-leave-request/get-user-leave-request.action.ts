import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserLeaveRequest } from "./get-user-leave-request.service";
import { GetUserLeaveRequestPayload } from "./get-user-leave-request.types";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getUserLeaveRequestAction = createAsyncThunk(
  LeaveActionType.GET_USER_LEAVE_REQUEST,
  async (payload: GetUserLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await getUserLeaveRequest(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
