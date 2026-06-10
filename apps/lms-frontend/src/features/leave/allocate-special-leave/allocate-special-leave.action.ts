import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AllocateSpecialLeave } from "./allocate-special-leave.type";
import { allocateSpecialLeave } from "./allocate-special-leave.service";
import { LeaveActionType } from "../leave.types";


export const allocateSpecialLeaveAction = createAsyncThunk(
  LeaveActionType.ALLOCATE_SPECIAL_LEAVE,
  async (payload: AllocateSpecialLeave, thunkAPI) => {
    try {
      const response = await allocateSpecialLeave(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response?.data?.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
