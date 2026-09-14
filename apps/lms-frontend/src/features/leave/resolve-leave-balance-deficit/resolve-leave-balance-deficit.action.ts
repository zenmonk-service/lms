import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { LeaveActionType } from "../leave.types";
import { ResolveLeaveBalanceDeficitPayload } from "./resolve-leave-balance-deficit.types";
import { resolveLeaveBalanceDeficit } from "./resolve-leave-balance-deficit.service";

export const resolveLeaveBalanceDeficitAction = createAsyncThunk(
  LeaveActionType.RESOLVE_LEAVE_BALANCE_DEFICIT,
  async (payload: ResolveLeaveBalanceDeficitPayload, thunkAPI) => {
    try {
      const response = await resolveLeaveBalanceDeficit(payload);
      toastSuccess("Leave balance deficit resolved successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
