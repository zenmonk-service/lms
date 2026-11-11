import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { QueryActionType } from "../query.types";
import { deleteQuery } from "./delete-query.service";
import { DeleteQueryPayload } from "./delete-query.types";

export const deleteQueryAction = createAsyncThunk(
  QueryActionType.DELETE_QUERY,
  async (payload: DeleteQueryPayload, thunkAPI) => {
    try {
      const response = await deleteQuery(payload);
      toastSuccess("Query deleted successfully");
      return { query_uuid: payload.query_uuid, ...(await response.json()) };
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
