import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { checkOutService } from "./check-out.service";
import { CheckOutPayload } from "./check-out.types";

export const checkOutAction = createAsyncThunk(
  AttendanceActionType.CHECK_OUT,
  async (payload: CheckOutPayload, { rejectWithValue }) => {
    try {
      const response = await checkOutService(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
