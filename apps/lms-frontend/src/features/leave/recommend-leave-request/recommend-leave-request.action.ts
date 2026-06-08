import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { RecommendLeaveRequestPayload } from "./recommend-leave-request.types";
import { recommendLeaveRequest } from "./recommend-leave-request.service";

export const recommendLeaveRequestAction = createAsyncThunk(
  "leave-requests/recommend",
  async (data: RecommendLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await recommendLeaveRequest(data);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error.message || "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
