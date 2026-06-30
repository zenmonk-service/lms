import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { GetAttendanceReportPayload } from "./report.type";
import { getAttendanceReport } from "./report.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";

export const getAttendanceReportAction = createAsyncThunk(
  AttendanceActionType.GET_ATTENDANCE_REPORT,
  async (payload: GetAttendanceReportPayload, thunkAPI) => {
    try {
      const response = await getAttendanceReport(payload);
      return { ...response.data, selectedMonth: payload.month ? true : false };
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
