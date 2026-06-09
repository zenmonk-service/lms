import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListUserLeaveBalancePayload } from "./list-user-leave-balance.types";
import { listUserLeaveBalances } from "./list-user-leave-balance.service";

export const listUserLeaveBalancesAction = createAsyncThunk(
  "orgnization/get-user-leave-balances",
  async (payload: ListUserLeaveBalancePayload, thunkAPI) => {
    try {
      const response = await listUserLeaveBalances(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
