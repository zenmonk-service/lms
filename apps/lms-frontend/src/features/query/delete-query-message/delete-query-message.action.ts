import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { QueryActionType } from "../query.types";
import { deleteQueryMessage } from "./delete-query-message.service";
import { DeleteQueryMessagePayload } from "./delete-query-message.types";

export const deleteQueryMessageAction = createAsyncThunk(
  QueryActionType.DELETE_QUERY_MESSAGE,
  async (payload: DeleteQueryMessagePayload, thunkAPI) => {
    try {
      const response = await deleteQueryMessage(payload);
      toastSuccess("Message deleted successfully");
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
