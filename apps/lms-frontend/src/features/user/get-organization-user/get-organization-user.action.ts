import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getOrganizationUser } from "./get-organization-user.service";
import { GetOrganizationUserPayload } from "./get-organization-user.types";
import { UserActionType } from "../user.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getOrganizationUserAction = createAsyncThunk(
  UserActionType.GET_ORGANIZATION_USERS,
  async (payload: GetOrganizationUserPayload, thunkAPI) => {
    try {
      const response = await getOrganizationUser(
        payload.user_uuid,
        payload.org_uuid,
      );
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
