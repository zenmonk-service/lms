import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListOrganizationPayload } from "./list-organization.types";
import { toastError } from "@/shared/toast/toast-error";
import { listOrganizations } from "./list-organization.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listOrganizationsAction = createAsyncThunk(
  OrganizationActionType.LIST_ORGANIZATIONS,
  async (payload: ListOrganizationPayload, thunkAPI) => {
    try {
      const response = await listOrganizations(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
