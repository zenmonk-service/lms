import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { QueryActionType } from "../query.types";
import { getQueryMessages } from "./get-query-messages.service";
import { GetQueryMessagesPayload } from "./get-query-messages.types";

export const getQueryMessagesAction = createAsyncThunk(
  QueryActionType.GET_QUERY_MESSAGES,
  async (payload: GetQueryMessagesPayload, thunkAPI) => {
    try {
      const response = await getQueryMessages(payload);
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
