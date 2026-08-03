import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { updateAttendance } from "./update-attendance.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";

export const updateAttendanceAction = createAsyncThunk(
  AttendanceActionType.UPDATE_ATTENDANCE,
  async (payload: UpdateAttendancePayload, thunkAPI) => {
    try {
      const response = await updateAttendance(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
