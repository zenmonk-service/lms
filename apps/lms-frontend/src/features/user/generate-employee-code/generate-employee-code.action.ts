import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { GenerateEmployeeCodePayload } from "./generate-employee-code.types";
import { generateEmployeeCode } from "./generate-employee-code.service";

export const generateEmployeeCodeAction = createAsyncThunk(
  UserActionType.GENERATE_EMPLOYEE_CODE,
  async (payload: GenerateEmployeeCodePayload, thunkAPI) => {
    try {
      const response = await generateEmployeeCode(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
