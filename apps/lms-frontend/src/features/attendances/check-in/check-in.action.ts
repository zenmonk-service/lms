import { createAsyncThunk } from "@reduxjs/toolkit";
import { AttendanceActionType } from "../attendances.type";
import { checkInService } from "./check-in.service";
import { CheckInPayload } from "./check-in.types";

export const checkInAction = createAsyncThunk(
  AttendanceActionType.CHECK_IN,
  async (payload: CheckInPayload, { rejectWithValue }) => {
    try {
      const response = await checkInService(payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data);
    }
  },
);
