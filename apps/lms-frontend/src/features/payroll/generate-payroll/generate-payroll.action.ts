import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { PayrollActionType } from "../payroll.types";
import { GeneratePayrollPayload } from "./generate-payroll.types";
import { generatePayroll } from "./generate-payroll.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const generatePayrollAction = createAsyncThunk(
  PayrollActionType.GENERATE_PAYROLL,
  async (payload: GeneratePayrollPayload, thunkAPI) => {
    try {
      const response = await generatePayroll(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
