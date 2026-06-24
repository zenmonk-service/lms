import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { updateAttendance } from "./update-attendance.service";


export const updateAttendanceAction = createAsyncThunk(
  AttendanceActionType.UPDATE_ATTENDANCE,
  async (payload: UpdateAttendancePayload, { rejectWithValue }) => {
    try {
      const response = await updateAttendance(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
