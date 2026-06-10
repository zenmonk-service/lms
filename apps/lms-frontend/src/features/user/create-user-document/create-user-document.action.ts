import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { createUserDocument } from "./create-user-document.service";
import { CreateUserDocumentPayload } from "./create-user-document.types";
import { UserActionType } from "../user.type";

export const createUserDocumentAction = createAsyncThunk(
  UserActionType.CREATE_USER_DOCUMENT,
  async (payload: CreateUserDocumentPayload, thunkAPI) => {
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
