import { createAsyncThunk } from "@reduxjs/toolkit";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { isResetLinkValid } from "./reset-valid-link.service";

export const isResetLinkValidAction = createAsyncThunk(
  UserActionType.IS_RESET_LINK_VALID,
  async (uid: string, thunkAPI) => {
    try {
      const response = await isResetLinkValid(uid);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
