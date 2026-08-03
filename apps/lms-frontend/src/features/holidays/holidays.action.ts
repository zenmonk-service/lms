import { createAsyncThunk } from "@reduxjs/toolkit";
import { getPublicHolidays } from "./holidays.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";

export const getPublicHolidaysAction = createAsyncThunk(
  "holidays/get-public-holidays",
  async (year: number | undefined, thunkAPI) => {
    try {
      const response = await getPublicHolidays(year);
      return response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
