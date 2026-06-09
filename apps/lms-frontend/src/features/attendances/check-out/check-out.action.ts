import { createAsyncThunk } from "@reduxjs/toolkit";
import { checkOutType } from "../attendances.type";
import { checkOutService } from "./check-out.service";
import { CheckOutPayload } from "./check-out.types";

export const checkOutAction = createAsyncThunk(
  checkOutType,
  async (payload: CheckOutPayload, { rejectWithValue }) => {
    try {
      const response = await checkOutService(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
