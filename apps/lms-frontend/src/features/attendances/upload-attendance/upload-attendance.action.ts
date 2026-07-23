import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { uploadAttendanceReport } from "./upload-attendance.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { UploadAttendancePayload } from "./upload-attendance.type";

export const uploadAttendanceReportAction = createAsyncThunk(
  AttendanceActionType.UPLOAD_ATTENDANCE_REPORT,
  async (payload: UploadAttendancePayload, thunkAPI) => {
    try {
      const response = await uploadAttendanceReport(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
