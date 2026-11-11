import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { listQueries } from "./list-queries.service";
import { ListQueriesPayload } from "./list-queries.types";

export const LIST_QUERIES_ACTION = "query/listQueries";

export const listQueriesAction = createAsyncThunk(
  LIST_QUERIES_ACTION,
  async (payload: ListQueriesPayload, thunkAPI) => {
    try {
      const response = await listQueries(payload);
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
