import { createSlice } from "@reduxjs/toolkit";
import { getUserAttendancesAction } from "./attendances.action";
import { Attendance } from "./attendances.type";




interface AttendanceState {
  isCheckedIn: boolean;
  attendances: Attendance[];
  error: string | null | unknown;
  loading : boolean;
}

const initialState: AttendanceState = {
  isCheckedIn: false,
  attendances: [],
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
      .addCase(getUserAttendancesAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserAttendancesAction.fulfilled, (state, action) => {
        state.attendances = action.payload;
        state.loading = false;
      })
      .addCase(getUserAttendancesAction.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch attendances";
        state.loading = false;
      })}
    });



    export const attendancesReducer = attendanceSlice.reducer;