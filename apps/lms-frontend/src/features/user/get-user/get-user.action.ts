import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetUserPayload } from "./get-user.types";
import { UserActionType } from "../user.type";
import { getUser } from "./get-user.service";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getUserAction = createAsyncThunk(
  UserActionType.GET_USER,
  async (payload: GetUserPayload, thunkAPI) => {
    try {
      const response = await getUser(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
