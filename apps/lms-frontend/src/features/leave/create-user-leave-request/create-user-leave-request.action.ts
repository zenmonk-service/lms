import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateLeaveRequestPayload } from "./create-user-leave-request.types";
import { createUserLeaveRequests } from "./create-user-leave-request.service";
import { LeaveActionType } from "../leave.types";

export const createUserLeaveRequestAction = createAsyncThunk(
  LeaveActionType.CREATE_USER_LEAVE_REQUEST,
  async (payload: CreateLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await createUserLeaveRequests(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
