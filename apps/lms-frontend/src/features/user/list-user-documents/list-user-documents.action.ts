import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { listUserDocuments } from "./list-user-documents.service";
import { ListUserDocumentsPayload } from "./list-user-documents.types";
import { UserActionType } from "../user.type";

export const listUserDocumentsAction = createAsyncThunk(
  UserActionType.LIST_USER_DOCUMENTS,
  async (payload: ListUserDocumentsPayload, thunkAPI) => {
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
