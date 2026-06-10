import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import { UserActionType } from "../user.type";
import { activateUser } from "./activate.user.service";
import { ActiveUserActionType } from "./activate-user.type";

export const activateUserAction = createAsyncThunk(
  UserActionType.ACTIVATE_USER, 
  async (payload: ActiveUserActionType, thunkAPI) => {
    try {
      const response = await activateUser(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
