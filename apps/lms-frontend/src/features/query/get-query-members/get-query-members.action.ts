import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { QueryActionType } from "../query.types";
import { getQueryMembers } from "./get-query-members.service";
import { GetQueryMembersPayload } from "./get-query-members.types";

export const getQueryMembersAction = createAsyncThunk(
  QueryActionType.GET_QUERY_MEMBERS,
  async (payload: GetQueryMembersPayload, thunkAPI) => {
    try {
      const response = await getQueryMembers(payload);
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
