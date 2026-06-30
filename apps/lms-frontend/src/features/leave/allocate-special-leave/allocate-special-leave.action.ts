import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AllocateSpecialLeave } from "./allocate-special-leave.type";
import { allocateSpecialLeave } from "./allocate-special-leave.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const allocateSpecialLeaveAction = createAsyncThunk(
  LeaveActionType.ALLOCATE_SPECIAL_LEAVE,
  async (payload: AllocateSpecialLeave, thunkAPI) => {
    try {
      const response = await allocateSpecialLeave(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
