import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteUserDocument } from "./delete-user-document.service";
import { DeleteUserDocumentPayload } from "./delete-user-document.types";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const deleteUserDocumentAction = createAsyncThunk(
  UserActionType.DELETE_USER_DOCUMENT,
  async (payload: DeleteUserDocumentPayload, thunkAPI) => {
    try {
      const response = await deleteUserDocument(
        payload.org_uuid,
        payload.user_uuid,
        payload.document_uuid,
      );
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
