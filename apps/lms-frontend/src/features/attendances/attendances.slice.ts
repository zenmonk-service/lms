import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getUserAttendancesAction } from "./get-user-attendances/get-user-attendances.action";
import { getUserTodayAttendancesAction } from "./get-user-today-attendances/get-user-today-attendances.action";
import type { Attendance, AttendanceState, AttendanceStatus } from "./attendances.type";
import { getAttendanceReportAction } from "./report/report.action";
import { updateAttendanceAction } from "./update-attendance/update-attendance.action";
import { createAttendanceAction } from "./create-attendance/create-attendance.action";
import { downloadAttendanceReportAction } from "./download/download.action";
import { listMissingAttendancesAction } from "./list-missing-attendances/list-missing-attendances.action";
import { createMissingAttendancesAction } from "./create-missing-attendances/create-missing-attendances.action";

const initialState: AttendanceState = {
  attendance: {} as Attendance,
  missingAttendanceDates: [],
  attendances: {
    rows: [] as Attendance[],
    current_page: 0,
    total: 0,
    per_page: 0,
    total_present_current_month: 0,
    total_absent_current_month: 0,
  },
  report: {} as AttendanceState["report"],
  error: null,
  loading: false,
};

const attendanceSlice = createSlice({
  name: "attendances",
  initialState,
  reducers: {
    patchAttendanceStatus: (state, action: PayloadAction<{ uuid: string; status: AttendanceStatus }>) => {
      const row = state.attendances.rows.find((r) => r.uuid === action.payload.uuid);
      if (row) row.status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAttendanceReportAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAttendanceReportAction.fulfilled, (state, action) => {
        state.report!.daily_attendance_report =
          action.payload.daily_attendance_report;
        state.report!.monthly_attendance_report =
          action.payload.monthly_attendance_report;

        if (action.payload.selectedMonth) {
          state.report!.user_attendance_report =
            action.payload.user_attendance_report;
        } else {
          state.report!.day_wise_attendance_report =
            action.payload.user_attendance_report;
        }
        state.loading = false;
      })
      .addCase(getAttendanceReportAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch attendances";
        state.loading = false;
      })
      .addCase(getUserTodayAttendancesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserTodayAttendancesAction.fulfilled, (state, action) => {
        state.attendance = action.payload;
        state.loading = false;
      })
      .addCase(getUserTodayAttendancesAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch attendances";
        state.loading = false;
      })
      .addCase(getUserAttendancesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserAttendancesAction.fulfilled, (state, action) => {
        state.attendances.rows = action.payload.rows;
        state.attendances.current_page = action.payload.current_page;
        state.attendances.total = action.payload.total;
        state.attendances.per_page = action.payload.per_page;
        state.attendances.total_present_current_month =
          action.payload.total_present_current_month;
        state.attendances.total_absent_current_month =
          action.payload.total_absent_current_month;
        state.loading = false;
      })
      .addCase(getUserAttendancesAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch attendances";
        state.loading = false;
      })
      .addCase(updateAttendanceAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAttendanceAction.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateAttendanceAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to update attendance";
        state.loading = false;
      })
      .addCase(createAttendanceAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createAttendanceAction.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(createAttendanceAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to create attendance";
        state.loading = false;
      }).addCase(downloadAttendanceReportAction.pending, (state) => {
      })
      .addCase(downloadAttendanceReportAction.fulfilled, (state, action) => {
      })
      .addCase(downloadAttendanceReportAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to download attendance report";
        state.loading = false;
      })
      .addCase(listMissingAttendancesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(listMissingAttendancesAction.fulfilled, (state, action) => {
        state.missingAttendanceDates = action.payload;
      })
      .addCase(listMissingAttendancesAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch missing attendances";
        state.loading = false;
      })
      .addCase(createMissingAttendancesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(createMissingAttendancesAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createMissingAttendancesAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to create missing attendances";
        state.loading = false;
      });
  },
});

export const { patchAttendanceStatus } = attendanceSlice.actions;
export const attendancesReducer = attendanceSlice.reducer;
