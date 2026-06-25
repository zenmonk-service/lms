import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetUserPayload } from "./get-user.types";
import { UserActionType } from "../user.type";
import { getUser } from "./get-user.service";

export const getUserAction = createAsyncThunk(
  UserActionType.GET_USER,
  async (payload: GetUserPayload, thunkAPI) => {
    try {
      const response = await getUser(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);