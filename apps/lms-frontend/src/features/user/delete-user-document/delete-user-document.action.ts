import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { deleteUserDocument } from "./delete-user-document.service";
import { DeleteUserDocumentPayload } from "./delete-user-document.types";

export const deleteUserDocumentAction = createAsyncThunk(
  "user/documents/delete",
  async (payload: DeleteUserDocumentPayload, thunkAPI) => {
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
