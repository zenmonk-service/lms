import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { OrganizationActionType } from "../organizations.types";
import { ActivateOrganizationPayload } from "./activate-organization.types";
import { activateOrganization } from "./activate-organization.service";
import { toastSuccess } from "@/shared/toast/toast-success";

export const activateOrganizationAction = createAsyncThunk(
  OrganizationActionType.ACTIVATE_ORGANIZATION,
  async (payload: ActivateOrganizationPayload, thunkAPI) => {
    try {
      const response = await activateOrganization(payload);
      toastSuccess("Organization activated successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
