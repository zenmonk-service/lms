import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listUser } from "./list-user.service";
import { ListUserPayload } from "./list-user.types";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listUserAction = createAsyncThunk(
  UserActionType.LIST_USERS,
  async (payload: ListUserPayload, thunkAPI) => {
    try {
      const response = await listUser(payload);
      return {
        ...response.data,
        isCurrentUser: payload.isCurrentUser,
        isInfiniteScroll: payload.isInfiniteScroll,
        email: payload.pagination.search,
      };
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
