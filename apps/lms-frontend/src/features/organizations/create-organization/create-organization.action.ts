import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateOrganizationPayload } from "./create-organization.types";
import { createOrganization } from "./create-organization.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const createOrganizationAction = createAsyncThunk(
  OrganizationActionType.CREATE_ORGANIZATION,
  async (payload: CreateOrganizationPayload, thunkAPI) => {
    try {
      const response = await createOrganization(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
