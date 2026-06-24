import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { getUserAttendanceService } from "./get-user-attendances.service";
import { GetUserAttendancesPayload } from "./get-user-attendances.types";

export const getUserAttendancesAction = createAsyncThunk(
  AttendanceActionType.GET_USER_ATTENDANCE,
  async (payload: GetUserAttendancesPayload, { rejectWithValue }) => {
    try {
      const response = await getUserAttendanceService(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
