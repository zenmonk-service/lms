import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { QueryActionType } from "../query.types";
import { createQueryMessage } from "./create-query-message.service";
import { CreateQueryMessagePayload } from "./create-query-message.types";

export const createQueryMessageAction = createAsyncThunk(
  QueryActionType.CREATE_QUERY_MESSAGE,
  async (payload: CreateQueryMessagePayload, thunkAPI) => {
    try {
      const response = await createQueryMessage(payload);
      toastSuccess("Message sent successfully");
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
