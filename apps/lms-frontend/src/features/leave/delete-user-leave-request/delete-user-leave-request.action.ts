import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteUserLeaveRequestPayload } from "./delete-user-leave-request.types";
import { deleteUserLeaveRequest } from "./delete-user-leave-request.service";
import { LeaveActionType } from "../leave.types";

export const deleteUserLeaveRequestAction = createAsyncThunk(
  LeaveActionType.DELETE_USER_LEAVE_REQUEST,
  async (payload: DeleteUserLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await deleteUserLeaveRequest(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
