import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { PayrollActionType } from "../payroll.types";
import { ListPayrollPayload } from "./list-payroll.types";
import { listPayroll } from "./list-payroll.service";

export const listPayrollAction = createAsyncThunk(
  PayrollActionType.LIST_PAYROLL,
  async (payload: ListPayrollPayload, thunkAPI) => {
    try {
      const response = await listPayroll(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
