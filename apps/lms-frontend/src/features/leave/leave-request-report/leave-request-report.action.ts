import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { LeaveActionType } from "../leave.types";
import { GetLeaveRequestsReportPayload } from "./leave-request-report.type";
import { getLeaveRequestsReport } from "./leave-request-report.service";

export const getLeaveRequestsReportAction = createAsyncThunk(
  LeaveActionType.GET_LEAVE_REQUESTS_REPORT,
  async (payload: GetLeaveRequestsReportPayload, thunkAPI) => {
    try {
      const response = await getLeaveRequestsReport(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
