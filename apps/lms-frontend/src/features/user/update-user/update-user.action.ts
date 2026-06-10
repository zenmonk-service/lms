import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { updateUser } from "./update-user.service";
import { UpdateUserPayload } from "./update-user.types";
import { UserActionType } from "../user.type";

export const updateUserAction = createAsyncThunk(
  UserActionType.UPDATE_USER,
  async (payload: UpdateUserPayload, thunkAPI) => {
    try {
      const response = await updateUser(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
