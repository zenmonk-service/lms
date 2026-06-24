import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateUserLeaveRequestPayload } from "./update-user-leave-request.types";
import { updateLeaveRequest } from "./update-user-leave-request.service";
import { LeaveActionType } from "../leave.types";

export const updateUserLeaveRequestAction = createAsyncThunk(
  LeaveActionType.UPDATE_USER_LEAVE_REQUEST,
  async (payload: UpdateUserLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await updateLeaveRequest(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
