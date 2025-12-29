import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getPublicHolidays } from "./holidays.service";

export const getPublicHolidaysAction = createAsyncThunk(
  "holidays/get-public-holidays",
  async (_, thunkAPI) => {
    try {
      const response = await getPublicHolidays();
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
