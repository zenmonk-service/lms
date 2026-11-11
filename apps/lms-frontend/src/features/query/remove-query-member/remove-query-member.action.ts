import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { QueryActionType } from "../query.types";
import { removeQueryMember } from "./remove-query-member.service";
import { RemoveQueryMemberPayload } from "./remove-query-member.types";

export const removeQueryMemberAction = createAsyncThunk(
  QueryActionType.REMOVE_QUERY_MEMBER,
  async (payload: RemoveQueryMemberPayload, thunkAPI) => {
    try {
      const response = await removeQueryMember(payload);
      toastSuccess("Member removed successfully");
      return await response.json();
    } catch (error) {
      const normalized = normalizeApiError(error);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
