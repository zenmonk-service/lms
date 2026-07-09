import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createUserDocument } from "./create-user-document.service";
import { CreateUserDocumentPayload } from "./create-user-document.types";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

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
          document_type: payload.document_type,
        },
      );
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
