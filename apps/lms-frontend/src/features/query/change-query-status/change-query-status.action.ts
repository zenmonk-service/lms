import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { QueryActionType } from "../query.types";
import { changeQueryStatus } from "./change-query-status.service";
import { ChangeQueryStatusPayload } from "./change-query-status.types";

export const changeQueryStatusAction = createAsyncThunk(
  QueryActionType.CHANGE_QUERY_STATUS,
  async (payload: ChangeQueryStatusPayload, thunkAPI) => {
    try {
      const response = await changeQueryStatus(payload);
      toastSuccess("Query status updated");
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
