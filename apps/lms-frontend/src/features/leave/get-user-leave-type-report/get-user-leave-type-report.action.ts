import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { LeaveActionType } from "../leave.types";
import { getUserLeaveTypeReport } from "./get-user-leave-type-report.service";

export const getUserLeaveTypeReportAction = createAsyncThunk(
  LeaveActionType.GET_USER_LEAVE_TYPE_REPORT,
  async (payload: GetUserLeaveTypeReportPayload, thunkAPI) => {
    try {
      const response = await getUserLeaveTypeReport(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
