import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateLeaveTypePayload } from "./create-leave-type.types";
import { createLeaveType } from "./create-leave-type.service";

export const createLeaveTypeAction = createAsyncThunk(
  "orgnization/leave-type",
  async (payload: CreateLeaveTypePayload, thunkAPI) => {
    try {
      const response = await createLeaveType(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);