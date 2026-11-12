import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { QueryActionType } from "../query.types";
import { addQueryMember } from "./add-query-member.service";
import { AddQueryMemberPayload } from "./add-query-member.types";

export const addQueryMemberAction = createAsyncThunk(
  QueryActionType.ADD_QUERY_MEMBER,
  async (payload: AddQueryMemberPayload, thunkAPI) => {
    try {
      const response = await addQueryMember(payload);
      toastSuccess("Members added");
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
