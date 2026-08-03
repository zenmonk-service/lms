import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateOrganizationSettingsPayload } from "./update-organization-settings.types";
import { updateOrganizationSettings } from "./update-organization-settings.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const updateOrganizationSettingsAction = createAsyncThunk(
  OrganizationActionType.UPDATE_ORGANIZATION_SETTINGS,
  async (payload: UpdateOrganizationSettingsPayload, thunkAPI) => {
    try {
      const response = await updateOrganizationSettings(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
