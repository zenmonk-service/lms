import { createSlice } from "@reduxjs/toolkit";
import {
  activateLeaveTypeAction,
  createLeaveTypeAction,
  deactivateLeaveTypeAction,
  getLeaveTypesAction,
  updateLeaveTypeAction,
} from "./leave-types.action";

interface Rows {
  uuid: string;
  name: string;
  code: string;
  description: string;
  applicable_for: {
    type: "string";
    value: string[];
  };
  max_consecutive_days: number | null;
  allow_negative_leaves: boolean;
  accrual: {
    period: string;
    leave_count: number;
    applicable_on: string;
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface LeaveTypeState {
  isLoading: boolean;
  leaveTypes: {
    count: number;
    rows: Rows[];
    current_page: number;
    per_page: number;
    total: number;
  };
}

const initialState: LeaveTypeState = {
  isLoading: false,
  leaveTypes: {
    count: 0,
    rows: [],
    current_page: 1,
    per_page: 10,
    total: 0,
  },
};

export const leaveTypeSlice = createSlice({
  name: "leave-type",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getLeaveTypesAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeaveTypesAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaveTypes = action.payload;
      })
      .addCase(getLeaveTypesAction.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateLeaveTypeAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateLeaveTypeAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateLeaveTypeAction.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(createLeaveTypeAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLeaveTypeAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(createLeaveTypeAction.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(activateLeaveTypeAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(activateLeaveTypeAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(activateLeaveTypeAction.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deactivateLeaveTypeAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deactivateLeaveTypeAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deactivateLeaveTypeAction.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default leaveTypeSlice.reducer;
