import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateUserLeaveRequestPayload } from "./update-user-leave-request.types";
import { updateLeaveRequest } from "./update-user-leave-request.service";

export const updateUserLeaveRequestAction = createAsyncThunk(
  "user/update-user-leave-requests",
  async (data: UpdateUserLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await updateLeaveRequest(data);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
