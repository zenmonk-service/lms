import { createSlice } from "@reduxjs/toolkit";
import { getPublicHolidaysAction } from "./holidays.action";

interface Row {
  uuid: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
}

interface Holidays {
  rows: Row[];
}

interface HolidaysState {
  holidays: Holidays;
  isLoading: boolean;
  error: string | null;
}

const initialState: HolidaysState = {
  holidays: {} as Holidays,
  isLoading: false,
  error: null,
};

const holidaysSlice = createSlice({
  name: "holidays",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getPublicHolidaysAction.fulfilled, (state, action) => {
        state.holidays.rows = action.payload.rows;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(getPublicHolidaysAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPublicHolidaysAction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const holidaysReducer = holidaysSlice.reducer;
