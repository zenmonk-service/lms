import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { getQuery } from "./get-query.service";
import { GetQueryPayload } from "./get-query.types";

export const GET_QUERY_ACTION = "query/getQuery";

export const getQueryAction = createAsyncThunk(
  GET_QUERY_ACTION,
  async (payload: GetQueryPayload, thunkAPI) => {
    try {
      const response = await getQuery(payload);
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
