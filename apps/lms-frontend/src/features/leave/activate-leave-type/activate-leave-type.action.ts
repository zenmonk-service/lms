import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ActivateLeaveTypePayload } from "./activate-leave-type.types";
import { activateLeaveType } from "./activate-leave-type.service";

export const activateLeaveTypeAction = createAsyncThunk(
  "orgnization/activate-leave-type",
  async (payload: ActivateLeaveTypePayload, thunkAPI) => {
    try {
      const response = await activateLeaveType(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);