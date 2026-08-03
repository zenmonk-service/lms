import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { ListMissingAttendancesPayload } from "./list-missing-attendances.types";
import { listMissingAttendancesService } from "./list-missing-attendances.service";

export const listMissingAttendancesAction = createAsyncThunk(
  AttendanceActionType.LIST_MISSING_ATTENDANCES,
  async (payload: ListMissingAttendancesPayload, thunkAPI) => {
    try {
      const response = await listMissingAttendancesService(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
