import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { DownloadAttendancePayload } from "./download.types";
import { downloadAttendanceReportService } from "./download.service";


export const downloadAttendanceReportAction = createAsyncThunk(
  AttendanceActionType.DOWNLOAD_ATTENDANCE_REPORT,
  async (payload: DownloadAttendancePayload, { rejectWithValue }) => {
    try {
      const response = await downloadAttendanceReportService(payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
