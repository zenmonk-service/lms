import { createSlice } from "@reduxjs/toolkit";
import { getUserAttendancesAction, getUserTodayAttendancesAction } from "./attendances.action";
import { Attendance } from "./attendances.type";


interface AttendanceState {
  attendance: Attendance;
  error: string | null | unknown;
  loading : boolean;
  attendances:{
    rows :Attendance[]
    current_page ?: number
    total ?: number
    per_page ? :  number;
    total_present_current_month : number;
    total_absent_current_month : number;
  }
}

const initialState: AttendanceState = {
  attendance:{} as Attendance,
  attendances : {
    rows: [] as Attendance[],
    current_page: 0,
    total: 0,
    per_page: 0,
    total_present_current_month : 0,
    total_absent_current_month : 0,
  },

  error: null,
  loading : false,
};



const attendanceSlice = createSlice({
  name: "attendances",
  initialState,
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserTodayAttendancesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserTodayAttendancesAction.fulfilled,  (state, action) => {
        state.attendance = action.payload;
        state.loading = false;
      })
      .addCase(getUserTodayAttendancesAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch attendances";
        state.loading = false;
      }).addCase(getUserAttendancesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserAttendancesAction.fulfilled,  (state, action) => {
        state.attendances.rows = action.payload.rows;
        state.attendances.current_page = action.payload.current_page;
        state.attendances.total = action.payload.total;
        state.attendances.per_page = action.payload.per_page;
        state.attendances.total_present_current_month = action.payload.total_present_current_month;
        state.attendances.total_absent_current_month = action.payload.total_absent_current_month;
        state.loading = false;
      })
      .addCase(getUserAttendancesAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch attendances";
        state.loading = false;
      })
    
    }
    });



    export const attendancesReducer = attendanceSlice.reducer;