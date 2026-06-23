import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { uploadAttendanceReport } from "./upload-attendance.service";


export const uploadAttendanceReportAction = createAsyncThunk(
  AttendanceActionType.UPLOAD_ATTENDANCE_REPORT,
  async (payload: FormData, { rejectWithValue }) => {
    try {
      const response = await uploadAttendanceReport(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
