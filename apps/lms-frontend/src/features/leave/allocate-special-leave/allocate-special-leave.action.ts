import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AllocateSpecialLeave } from "./allocate-special-leave.type";
import { allocateSpecialLeave } from "./allocate-special-leave.service";


export const allocateSpecialLeaveAction = createAsyncThunk(
  "leave-requests/allocate-special",
  async (data: AllocateSpecialLeave, thunkAPI) => {
    try {
      const response = await allocateSpecialLeave(data);
      return response.data;
    } catch (err: any) {
      toastError(err.response?.data?.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
