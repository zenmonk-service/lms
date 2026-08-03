import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { getUserAttendanceService } from "./get-user-attendances.service";
import { GetUserAttendancesPayload } from "./get-user-attendances.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";

export const getUserAttendancesAction = createAsyncThunk(
  AttendanceActionType.GET_USER_ATTENDANCE,
  async (payload: GetUserAttendancesPayload, thunkAPI) => {
    try {
      const response = await getUserAttendanceService(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
