import { createSlice } from "@reduxjs/toolkit";
import {
  createOrganizationShiftsAction,
  listOrganizationShiftsAction,
} from "./shift.action";

export interface Shift {
  uuid: string;
  name: string;
  start_time: string;
  end_time: string;
  effective_hours: number;
  flexible_time: string;
}
interface ShiftState {
  isLoading: boolean;
  error?: string | null;
  shifts: Shift[];
}

const initialState: ShiftState = {
  isLoading: false,
  error: null,
  shifts: [],
};

export const shiftSlice = createSlice({
  name: "shift",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listOrganizationShiftsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listOrganizationShiftsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shifts = action.payload || [];
      })
      .addCase(listOrganizationShiftsAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to fetch shifts";
      })
      .addCase(createOrganizationShiftsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganizationShiftsAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(
        createOrganizationShiftsAction.rejected,
        (state, action: any) => {
          state.isLoading = false;
          state.error = action?.payload?.message || "Failed to create shift";
        }
      );
  },
});

export const shiftsReducer = shiftSlice.reducer;
