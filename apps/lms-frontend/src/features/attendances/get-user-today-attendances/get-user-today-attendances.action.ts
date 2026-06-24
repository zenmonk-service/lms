import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserTodayAttendanceService } from "./get-user-today-attendances.service";
import { GetUserTodayAttendancesPayload } from "./get-user-today-attendances.types";
import { AttendanceActionType } from "../attendances.type";

export const getUserTodayAttendancesAction = createAsyncThunk(
  AttendanceActionType.GET_USER_TODAY_ATTENDANCE,
  async (payload: GetUserTodayAttendancesPayload, { rejectWithValue }) => {
    try {
      const response = await getUserTodayAttendanceService(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
