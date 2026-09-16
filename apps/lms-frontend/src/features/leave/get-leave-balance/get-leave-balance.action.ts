import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getLeaveBalance } from "./get-leave-balance.service";
import { GetLeaveBalancePayload } from "./get-leave-balance.types";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getLeaveBalanceAction = createAsyncThunk(
  LeaveActionType.GET_LEAVE_BALANCE,
  async (payload: GetLeaveBalancePayload, thunkAPI) => {
    try {
      const response = await getLeaveBalance(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
