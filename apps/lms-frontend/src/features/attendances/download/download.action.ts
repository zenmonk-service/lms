import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { DownloadAttendancePayload } from "./download.types";
import { downloadAttendanceReportService } from "./download.service";
import { toastSuccess } from "@/shared/toast/toast-success";


export const downloadAttendanceReportAction = createAsyncThunk(
  AttendanceActionType.DOWNLOAD_ATTENDANCE_REPORT,
  async (payload: DownloadAttendancePayload, { rejectWithValue }) => {
    try {
      const response = await downloadAttendanceReportService(payload);
      toastSuccess("Attendance report downloaded successfully");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
