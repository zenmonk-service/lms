import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createUser } from "./create-user.service";
import { CreateUserPayload } from "./create-user.types";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const createUserAction = createAsyncThunk(
  UserActionType.CREATE_USER,
  async (payload: CreateUserPayload, thunkAPI) => {
    try {
      const response = await createUser(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
