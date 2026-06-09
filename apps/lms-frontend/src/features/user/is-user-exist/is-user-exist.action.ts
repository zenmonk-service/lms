import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { isUserExist } from "./is-user-exist.service";

export const isUserExistAction = createAsyncThunk(
  "auth/exists",
  async (payload: string, thunkAPI) => {
    try {
      const response = await isUserExist(payload);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
