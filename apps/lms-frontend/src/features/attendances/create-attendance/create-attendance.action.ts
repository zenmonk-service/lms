import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { createAttendance } from "./create-attendance.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const createAttendanceAction = createAsyncThunk(
  AttendanceActionType.CREATE_ATTENDANCE,
  async (payload: CreateAttendancePayload, thunkAPI) => {
    try {
      const response = await createAttendance(payload);
      toastSuccess("Attendance created successfully");
      return response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
