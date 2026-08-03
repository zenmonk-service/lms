import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateUser } from "./update-user.service";
import { UpdateUserPayload } from "./update-user.types";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const updateUserAction = createAsyncThunk(
  UserActionType.UPDATE_USER,
  async (
    payload: Partial<UpdateUserPayload> & {
      org_uuid: string;
      user_uuid: string;
    },
    thunkAPI,
  ) => {
    try {
      const response = await updateUser(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
