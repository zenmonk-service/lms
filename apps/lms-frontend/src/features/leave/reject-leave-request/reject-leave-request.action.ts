import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RejectLeaveRequestPayload } from "./reject-leave-request.types";
import { rejectLeaveRequest } from "./reject-leave-request.service";

export const rejectLeaveRequestAction = createAsyncThunk(
  "leave-requests/reject",
  async (data: RejectLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await rejectLeaveRequest(data);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
