import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateLeaveTypePayload } from "./create-leave-type.types";
import { createLeaveType } from "./create-leave-type.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const createLeaveTypeAction = createAsyncThunk(
  LeaveActionType.CREATE_LEAVE_TYPE,
  async (payload: CreateLeaveTypePayload, thunkAPI) => {
    try {
      const response = await createLeaveType(payload);
      toastSuccess("Leave type successfully created!");
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
