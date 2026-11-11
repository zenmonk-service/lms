import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { QueryActionType } from "../query.types";
import { createQuery } from "./create-query.service";
import { CreateQueryPayload } from "./create-query.types";

export const createQueryAction = createAsyncThunk(
  QueryActionType.CREATE_QUERY,
  async (payload: CreateQueryPayload, thunkAPI) => {
    try {
      const response = await createQuery(payload);
      toastSuccess("Query created successfully");
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
