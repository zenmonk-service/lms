import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { uploadAttendanceReport } from "./upload-attendance.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { UploadAttendancePayload } from "./upload-attendance.type";
import { toastSuccess } from "@/shared/toast/toast-success";
import { toastWarning } from "@/shared/toast/toast-warning";

export const uploadAttendanceReportAction = createAsyncThunk(
  AttendanceActionType.UPLOAD_ATTENDANCE_REPORT,
  async (payload: UploadAttendancePayload, thunkAPI) => {
    try {
      const response = await uploadAttendanceReport(payload);
      const jsonResponse = await response.json();
      if(response.ok && jsonResponse?.data?.failed > 0){
        toastWarning("Attendance report uploaded with some failed records");
      }else{
        toastSuccess("Attendance report uploaded successfully");
      }
      return jsonResponse;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
