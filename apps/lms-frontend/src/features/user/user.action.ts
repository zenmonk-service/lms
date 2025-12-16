import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { SignInInterface } from "./user.slice";
import {
  createUser,
  isUserExist,
  listUser,
  signIn,
  updateUser,
} from "./user.service";
import {
  CreateUserPayload,
  listUserPayload,
  UpdateUserPayload,
} from "./user.type";
import { toastError } from "@/shared/toast/toast-error";

export const signInAction = createAsyncThunk(
  "auth/signIn",
  async (signInfo: SignInInterface, thunkAPI) => {
    try {
      const response = await signIn(signInfo);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const createUserAction = createAsyncThunk(
  "auth/create",
  async (payload: CreateUserPayload, thunkAPI) => {
    try {
      const response = await createUser(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const updateUserAction = createAsyncThunk(
  "auth/update",
  async (payload: UpdateUserPayload, thunkAPI) => {
    try {
      const response = await updateUser(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const listUserAction = createAsyncThunk(
  "auth/list",
  async (payload: listUserPayload, thunkAPI) => {
    try {
      const response = await listUser(payload.pagination, payload.org_uuid);
      return {
        ...response.data,
        isCurrentUser: payload.isCurrentUser,
        email: payload.pagination.search,
      };
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const isUserExistAction = createAsyncThunk(
  "auth/exists",
  async (payload: string, thunkAPI) => {
    try {
      const response = await isUserExist(payload);
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
