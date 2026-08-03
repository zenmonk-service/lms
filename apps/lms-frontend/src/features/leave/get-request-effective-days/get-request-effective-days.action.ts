import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { LeaveActionType } from "../leave.types";
import { GetRequestEffectiveDaysPayload } from "./get-request-effective-days.types";
import { getRequestEffectiveDays } from "./get-request-effective-days.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getRequestEffectiveDaysAction = createAsyncThunk(
  LeaveActionType.GET_REQUEST_EFFECTIVE_DAYS,
  async (payload: GetRequestEffectiveDaysPayload, thunkAPI) => {
    try {
      const response = await getRequestEffectiveDays(payload);
      return response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
