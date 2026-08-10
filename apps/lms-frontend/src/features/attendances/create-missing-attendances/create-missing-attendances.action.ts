import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { CreateMissingAttendancesPayload } from "./create-missing-attendances.types";
import { createMissingAttendancesService } from "./create-missing-attendances.service";
import { toastSuccess } from "@/shared/toast/toast-success";

export const createMissingAttendancesAction = createAsyncThunk(
  AttendanceActionType.CREATE_MISSING_ATTENDANCES,
  async (payload: CreateMissingAttendancesPayload, thunkAPI) => {
    try {
      const response = await createMissingAttendancesService(payload);
      toastSuccess("Missing attendances created successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
