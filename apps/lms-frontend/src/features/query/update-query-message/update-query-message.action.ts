import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { QueryActionType } from "../query.types";
import { updateQueryMessage } from "./update-query-message.service";
import { UpdateQueryMessagePayload } from "./update-query-message.types";

export const updateQueryMessageAction = createAsyncThunk(
  QueryActionType.UPDATE_QUERY_MESSAGE,
  async (payload: UpdateQueryMessagePayload, thunkAPI) => {
    try {
      const response = await updateQueryMessage(payload);
      toastSuccess("Message updated successfully");
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
