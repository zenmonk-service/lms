import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateOrganizationSettingsPayload } from "./update-organization-settings.types";
import { updateOrganizationSettings } from "./update-organization-settings.service";
import { OrganizationActionType } from "../organizations.types";

export const updateOrganizationSettingsAction = createAsyncThunk(
  OrganizationActionType.UPDATE_ORGANIZATION_SETTINGS,
  async (payload: UpdateOrganizationSettingsPayload, thunkAPI) => {
    try {
      const response = await updateOrganizationSettings(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);