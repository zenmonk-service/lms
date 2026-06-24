import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listUserLeaveRequests } from "./list-user-leave-requests.service";
import { ListUserLeaveRequestsPayload } from "./list-user-leave-requests.types";
import { LeaveActionType } from "../leave.types";

export const listUserLeaveRequestsAction = createAsyncThunk(
  LeaveActionType.LIST_USER_LEAVE_REQUESTS,
  async (payload: ListUserLeaveRequestsPayload, thunkAPI) => {
    try {
      const response = await listUserLeaveRequests(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
