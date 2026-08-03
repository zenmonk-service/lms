import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListUserOrganizationsPayload } from "./list-user-organizations.types";
import { toastError } from "@/shared/toast/toast-error";
import { listUserOrganizations } from "./list-user-organizations.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listUserOrganizationsAction = createAsyncThunk(
  OrganizationActionType.LIST_USER_ORGANIZATIONS,
  async (payload: ListUserOrganizationsPayload, thunkAPI) => {
    try {
      const response = await listUserOrganizations(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
