import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { GetAttendanceReportPayload } from "./report.type";
import { getAttendanceReport } from "./report.service";

export const getAttendanceReportAction = createAsyncThunk(
  AttendanceActionType.GET_ATTENDANCE_REPORT,
  async (payload: GetAttendanceReportPayload, { rejectWithValue }) => {
    try {
      const response = await getAttendanceReport(payload);
      return { ...response.data, selectedMonth: payload.month ? true : false };
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
