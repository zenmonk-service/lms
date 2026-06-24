import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListLeaveTypesPayload } from "./list-leave-types.types";
import { listLeaveTypes } from "./list-leave-types.service";
import { LeaveActionType } from "../leave.types";

export const listLeaveTypesAction = createAsyncThunk(
  LeaveActionType.LIST_LEAVE_TYPES,
  async (payload: ListLeaveTypesPayload, thunkAPI) => {
    try {
      const response = await listLeaveTypes(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
