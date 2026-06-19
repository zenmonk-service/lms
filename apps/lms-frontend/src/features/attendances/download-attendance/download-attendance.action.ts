import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { DownloadAttendanceReportPayload } from "./download-attendance.type";
import { downloadAttendanceReport } from "./download-attendance.service";

export const downloadAttendanceReportAction = createAsyncThunk(
  AttendanceActionType.DOWNLOAD_ATTENDANCE_REPORT,
  async (payload: DownloadAttendanceReportPayload, { rejectWithValue }) => {
    try {
      const response = await downloadAttendanceReport(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
