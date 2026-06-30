import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetOrganizationSettingsPayload } from "./get-organization-settings.types";
import { getOrganizationSettings } from "./get-organization-settings.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getOrganizationSettingsAction = createAsyncThunk(
  OrganizationActionType.GET_ORGANIZATION_SETTINGS,
  async (payload: GetOrganizationSettingsPayload, thunkAPI) => {
    try {
      const response = await getOrganizationSettings(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
