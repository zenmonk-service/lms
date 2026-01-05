import { createAsyncThunk } from "@reduxjs/toolkit";
import { listOrganizationShiftsService } from "./shift.service";
import { AxiosError } from "axios";
import { toastError } from "@/shared/toast/toast-error";
import { listOrganizationShiftsType, ListShift } from "./shift.type";

export const listOrganizationShiftsAction = createAsyncThunk(
  listOrganizationShiftsType,
  async (payload: ListShift, thunkAPI) => {
    try {
      const response = await listOrganizationShiftsService();
     return response.data;
    } catch (err: any) {
console.log('✌️err --->', err);
      toastError(err?.response?.data?.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
