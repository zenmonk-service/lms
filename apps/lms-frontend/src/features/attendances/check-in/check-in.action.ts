import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { checkInService } from "./check-in.service";
import { CheckInPayload } from "./check-in.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const checkInAction = createAsyncThunk(
  AttendanceActionType.CHECK_IN,
  async (payload: CheckInPayload, thunkAPI) => {
    try {
      const response = await checkInService(payload);
      toastSuccess("Check-in Successful");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
