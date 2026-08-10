import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { checkOutService } from "./check-out.service";
import { CheckOutPayload } from "./check-out.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const checkOutAction = createAsyncThunk(
  AttendanceActionType.CHECK_OUT,
  async (payload: CheckOutPayload, thunkAPI) => {
    try {
      const response = await checkOutService(payload);
      toastSuccess("Check-out Successful");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
