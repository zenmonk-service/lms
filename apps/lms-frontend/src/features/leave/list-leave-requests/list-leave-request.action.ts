import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listLeaveRequests } from "./list-leave-requests.service";
import { ListLeaveRequestsPayload } from "./list-leave-requests.types";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listLeaveRequestsAction = createAsyncThunk(
  LeaveActionType.LIST_LEAVE_REQUESTS,
  async (payload: ListLeaveRequestsPayload, thunkAPI) => {
    try {
      const response = await listLeaveRequests(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
