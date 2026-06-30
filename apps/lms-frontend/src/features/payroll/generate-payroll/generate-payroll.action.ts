import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { PayrollActionType } from "../payroll.types";
import { GeneratePayrollPayload } from "./generate-payroll.types";
import { generatePayroll } from "./generate-payroll.service";

export const generatePayrollAction = createAsyncThunk(
  PayrollActionType.GENERATE_PAYROLL,
  async (payload: GeneratePayrollPayload, thunkAPI) => {
    try {
      const response = await generatePayroll(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
