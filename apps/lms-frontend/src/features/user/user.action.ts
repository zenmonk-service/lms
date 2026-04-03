import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { SignInInterface } from "./user.slice";
import {
  createUserDocument,
  createUser,
  deleteUserDocument,
  isUserExist,
  listUserDocuments,
  listUser,
  signIn,
  updateUser,
  getOrganizationUser,
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
  },
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
  },
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
  },
);

export const listUserAction = createAsyncThunk(
  "auth/list",
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
  },
);

export const listUserDocumentsAction = createAsyncThunk(
  "user/documents/list",
  async (payload: { org_uuid: string; user_uuid: string }, thunkAPI) => {
    try {
      const response = await listUserDocuments(
        payload.org_uuid,
        payload.user_uuid,
      );
      return response.data;
    } catch (err: any) {
      toastError(
        err.response?.data?.error ?? "Failed to fetch user documents.",
      );
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const createUserDocumentAction = createAsyncThunk(
  "user/documents/create",
  async (
    payload: {
      org_uuid: string;
      user_uuid: string;
      document_name: string;
      document_number?: string;
      file_url: string;
      file_urls?: string[];
      metadata?: Record<string, string | string[]>;
    },
    thunkAPI,
  ) => {
    try {
      const response = await createUserDocument(
        payload.org_uuid,
        payload.user_uuid,
        {
          document_name: payload.document_name,
          document_number: payload.document_number,
          file_url: payload.file_url,
          file_urls: payload.file_urls,
          metadata: payload.metadata,
        },
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response?.data?.error ?? "Failed to create document.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);

export const deleteUserDocumentAction = createAsyncThunk(
  "user/documents/delete",
  async (
    payload: { org_uuid: string; user_uuid: string; document_uuid: string },
    thunkAPI,
  ) => {
    try {
      const response = await deleteUserDocument(
        payload.org_uuid,
        payload.user_uuid,
        payload.document_uuid,
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response?.data?.error ?? "Failed to delete document.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);


export const getOrganizationUserAction = createAsyncThunk(
  "user/organization/get",
  async (payload: { org_uuid: string; user_uuid: string }, thunkAPI) => {
    try {
      const response = await getOrganizationUser(payload.user_uuid , payload.org_uuid);
      return response.data;
    } catch (err: any) {
      toastError(
        err.response?.data?.error ?? "Failed to fetch organization user.",
      );
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
      