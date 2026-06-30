import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateOrganizationPayload } from "./update-organization.types";
import { updateOrganization } from "./update-organization.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const updateOrganizationAction = createAsyncThunk(
  OrganizationActionType.UPDATE_ORGANIZATION,
  async (payload: UpdateOrganizationPayload, thunkAPI) => {
    try {
      const response = await updateOrganization(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
