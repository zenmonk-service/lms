import { createSlice } from "@reduxjs/toolkit";
import {
  createOrganizationShiftAction,
  deleteOrganizationShiftAction,
  listOrganizationShiftsAction,
  updateOrganizationShiftAction,
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
      .addCase(createOrganizationShiftAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createOrganizationShiftAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(createOrganizationShiftAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to create shift";
      })
      .addCase(updateOrganizationShiftAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateOrganizationShiftAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(updateOrganizationShiftAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to update shift";
      })
      .addCase(deleteOrganizationShiftAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteOrganizationShiftAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(deleteOrganizationShiftAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action?.payload?.message || "Failed to delete shift";
      });
  },
});

export const shiftsReducer = shiftSlice.reducer;
