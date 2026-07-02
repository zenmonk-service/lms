import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { OrganizationActionType } from "../organizations.types";
import { DeactivateOrganizationPayload } from "./deactivate-organization.types";
import { deactivateOrganization } from "./deactivate-organization.service";

export const deactivateOrganizationAction = createAsyncThunk(
  OrganizationActionType.DEACTIVATE_ORGANIZATION,
  async (payload: DeactivateOrganizationPayload, thunkAPI) => {
    try {
      const response = await deactivateOrganization(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
