import { createAsyncThunk } from "@reduxjs/toolkit";
import { listOrganizationShiftsService } from "./shift.service";
import { toastError } from "@/shared/toast/toast-error";
import { listOrganizationShiftsType, ListShift } from "./shift.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listOrganizationShiftsAction = createAsyncThunk(
  listOrganizationShiftsType,
  async (payload: ListShift, thunkAPI) => {
    try {
      const response = await listOrganizationShiftsService(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
