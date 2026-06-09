import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserTodayAttendanceType } from "../attendances.type";
import { getUserTodayAttendanceService } from "./get-user-today-attendances.service";
import { GetUserTodayAttendancesPayload } from "./get-user-today-attendances.types";

export const getUserTodayAttendancesAction = createAsyncThunk(
  getUserTodayAttendanceType,
  async (payload: GetUserTodayAttendancesPayload, { rejectWithValue }) => {
    try {
      const response = await getUserTodayAttendanceService(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
