import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { listUser } from "./list-user.service";
import { listUserPayload } from "./list-user.types";
import { UserActionType } from "../user.type";

export const listUserAction = createAsyncThunk(
  UserActionType.LIST_USERS,
  async (payload: listUserPayload, thunkAPI) => {
    try {
      const response = await listUser(payload.pagination, payload.org_uuid);
      return {
        ...response.data,
        isCurrentUser: payload.isCurrentUser,
        isInfiniteScroll: payload.isInfiniteScroll,
        email: payload.pagination.search,
      };
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
