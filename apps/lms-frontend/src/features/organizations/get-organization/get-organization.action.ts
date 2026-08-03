import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetOrganizationPayload } from "./get-organization.types";
import { getOrganization } from "./get-organization.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getOrganizationAction = createAsyncThunk(
  OrganizationActionType.GET_ORGANIZATION,
  async (payload: GetOrganizationPayload, thunkAPI) => {
    try {
      const response = await getOrganization(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
