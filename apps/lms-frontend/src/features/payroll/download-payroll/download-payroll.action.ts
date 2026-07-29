import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { PayrollActionType } from "../payroll.types";

import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { DownloadPayrollPayload } from "./download-payroll.types";
import { downloadPayroll } from "./download-payroll.service";
import { downloadExcelService } from "@/features/download-excel/download-excel.service";

export const downloadPayrollAction = createAsyncThunk(
  PayrollActionType.DOWNLOAD_PAYROLL,
  async (payload: DownloadPayrollPayload, thunkAPI) => {
    try {
      const response = await downloadPayroll(payload);
      await downloadExcelService({ response, fileName: `payroll-${payload.period}.xlsx` });
      return;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
