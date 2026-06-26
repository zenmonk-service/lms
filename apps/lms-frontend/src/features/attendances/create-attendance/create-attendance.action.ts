import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { createAttendance } from "./create-attendance.service";


export const createAttendanceAction = createAsyncThunk(
  AttendanceActionType.CREATE_ATTENDANCE,
  async (payload: CreateAttendancePayload, { rejectWithValue }) => {
    try {
      const response = await createAttendance(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
