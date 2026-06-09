import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeactivateLeaveTypePayload } from "./deactivate-leave-type.types";
import { deactivateLeaveType } from "./deactivate-leave-type.service";

export const deactivateLeaveTypeAction = createAsyncThunk(
  "orgnization/deactivate-leave-type",
  async (payload: DeactivateLeaveTypePayload, thunkAPI) => {
    try {
      const response = await deactivateLeaveType(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);