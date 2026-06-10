import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { UserActionType } from "../user.type";
import { DeactivateUserActionType } from "./deactivate-user.type";
import { deactivateUser } from "./deactivate-user.service";


export const deactivateUserAction = createAsyncThunk(
  UserActionType.DEACTIVATE_USER,
  async (payload: DeactivateUserActionType, thunkAPI) => {
    try {
      const response = await deactivateUser(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
