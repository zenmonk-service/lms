import { createSlice } from "@reduxjs/toolkit";
import { PayrollState } from "./payroll.types";
import { listPayrollAction } from "./list-payroll/list-payroll.action";
import { generatePayrollAction } from "./generate-payroll/generate-payroll.action";
import { downloadPayrollAction } from "./download-payroll/download-payroll.action";

const initialState: PayrollState = {
  isLoading: false,
  isDownloading: false,
  payroll: {
    count: 0,
    rows: [],
    current_page: 1,
    per_page: 10,
    total: 0,
  },
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(listPayrollAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(listPayrollAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payroll = action.payload;
      })
      .addCase(listPayrollAction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(generatePayrollAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generatePayrollAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(generatePayrollAction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(downloadPayrollAction.pending, (state) => {
        state.isDownloading = true;
      })
      .addCase(downloadPayrollAction.fulfilled, (state) => {
        state.isDownloading = false;
      })
      .addCase(downloadPayrollAction.rejected, (state) => {
        state.isDownloading = false;
      });
  },
});

export const payrollReducer = payrollSlice.reducer;
