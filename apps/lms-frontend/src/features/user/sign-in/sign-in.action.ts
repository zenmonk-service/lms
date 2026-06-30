import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { signIn } from "./sign-in.service";
import { SignInInterface } from "./sign-in.types";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const signInAction = createAsyncThunk(
  UserActionType.SIGN_IN,
  async (signInfo: SignInInterface, thunkAPI) => {
    try {
      const response = await signIn(signInfo);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
