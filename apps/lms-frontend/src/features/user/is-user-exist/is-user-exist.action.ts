import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { isUserExist } from "./is-user-exist.service";
import { UserActionType } from "../user.type";

export const isUserExistAction = createAsyncThunk(
 UserActionType.IS_USER_EXIST,
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
