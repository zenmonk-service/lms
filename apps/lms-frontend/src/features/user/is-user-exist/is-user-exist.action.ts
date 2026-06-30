import { createAsyncThunk } from "@reduxjs/toolkit";
import { isUserExist } from "./is-user-exist.service";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";

export const isUserExistAction = createAsyncThunk(
  UserActionType.IS_USER_EXIST,
  async (payload: string, thunkAPI) => {
    try {
      const response = await isUserExist(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
