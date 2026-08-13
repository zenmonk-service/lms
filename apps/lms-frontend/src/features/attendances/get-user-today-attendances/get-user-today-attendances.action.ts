import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserTodayAttendanceService } from "./get-user-today-attendances.service";
import { GetUserTodayAttendancesPayload } from "./get-user-today-attendances.types";
import { AttendanceActionType } from "../attendances.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";

export const getUserTodayAttendancesAction = createAsyncThunk(
  AttendanceActionType.GET_USER_TODAY_ATTENDANCE,
  async (payload: GetUserTodayAttendancesPayload, thunkAPI) => {
    try {
      const response = await getUserTodayAttendanceService(payload);
      return { ...(await response.json()), pathname: payload.pathname };
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
