import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { LeaveActionType } from "../leave.types";
import { GetRequestEffectiveDaysPayload } from "./get-request-effective-days.types";
import { getRequestEffectiveDays } from "./get-request-effective-days.service";

export const getRequestEffectiveDaysAction = createAsyncThunk(
  LeaveActionType.GET_REQUEST_EFFECTIVE_DAYS,
  async (payload: GetRequestEffectiveDaysPayload, thunkAPI) => {
    try {
      const response = await getRequestEffectiveDays(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);