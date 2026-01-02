import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getPublicHolidays } from "./holidays.service";

export const getPublicHolidaysAction = createAsyncThunk(
  "holidays/get-public-holidays",
  async (year: number | undefined, thunkAPI) => {
    try {
      const response = await getPublicHolidays(year);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
