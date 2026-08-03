import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listUserDocuments } from "./list-user-documents.service";
import { ListUserDocumentsPayload } from "./list-user-documents.types";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listUserDocumentsAction = createAsyncThunk(
  UserActionType.LIST_USER_DOCUMENTS,
  async (payload: ListUserDocumentsPayload, thunkAPI) => {
    try {
      const response = await listUserDocuments(
        payload.org_uuid,
        payload.user_uuid,
      );
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
