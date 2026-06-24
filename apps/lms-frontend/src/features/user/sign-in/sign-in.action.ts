import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { signIn } from "./sign-in.service";
import { SignInInterface } from "./sign-in.types";
import { UserActionType } from "../user.type";

export const signInAction = createAsyncThunk(
  UserActionType.SIGN_IN,
  async (signInfo: SignInInterface, thunkAPI) => {
    try {
      const response = await signIn(signInfo);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
