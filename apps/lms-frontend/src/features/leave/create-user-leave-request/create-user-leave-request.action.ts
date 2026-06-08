import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateLeaveRequestPayload } from "./create-user-leave-request.types";
import { createUserLeaveRequests } from "./create-user-leave-request.service";

export const createUserLeaveRequestAction = createAsyncThunk(
  "orgnization/create-user-leave-requests",
  async (data: CreateLeaveRequestPayload, thunkAPI) => {
    try {
      const response = await createUserLeaveRequests(data);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
