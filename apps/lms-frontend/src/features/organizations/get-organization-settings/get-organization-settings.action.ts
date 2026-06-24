import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetOrganizationSettingsPayload } from "./get-organization-settings.types";
import { getOrganizationSettings } from "./get-organization-settings.service";

export const getOrganizationSettingsAction = createAsyncThunk(
  "organizations/get-settings",
  async (payload: GetOrganizationSettingsPayload, thunkAPI) => {
    try {
      const response = await getOrganizationSettings(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);