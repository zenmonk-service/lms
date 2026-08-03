import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListUserLeaveBalancePayload } from "./list-user-leave-balance.types";
import { listUserLeaveBalances } from "./list-user-leave-balance.service";
import { LeaveActionType } from "../leave.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listUserLeaveBalancesAction = createAsyncThunk(
  LeaveActionType.LIST_USER_LEAVE_BALANCES,
  async (payload: ListUserLeaveBalancePayload, thunkAPI) => {
    try {
      const response = await listUserLeaveBalances(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
