import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listUserLeaveRequests } from "./list-user-leave-requests.service";
import { ListUserLeaveRequestsPayload } from "./list-user-leave-requests.types";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listUserLeaveRequestsAction = createAsyncThunk(
  LeaveActionType.LIST_USER_LEAVE_REQUESTS,
  async (payload: ListUserLeaveRequestsPayload, thunkAPI) => {
    try {
      const response = await listUserLeaveRequests(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
