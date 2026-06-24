import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listLeaveRequests } from "./list-leave-requests.service";
import { ListLeaveRequestsPayload } from "./list-leave-requests.types";
import { LeaveActionType } from "../leave.types";

export const listLeaveRequestsAction = createAsyncThunk(
  LeaveActionType.LIST_LEAVE_REQUESTS,
  async (payload: ListLeaveRequestsPayload, thunkAPI) => {
    try {
      const response = await listLeaveRequests(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
