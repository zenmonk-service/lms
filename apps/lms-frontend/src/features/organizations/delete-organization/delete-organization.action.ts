import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteOrganizationPayload } from "./delete-organization.types";
import { deleteOrganization } from "./delete-organization.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const deleteOrganizationAction = createAsyncThunk(
  OrganizationActionType.DELETE_ORGANIZATION,
  async (payload: DeleteOrganizationPayload, thunkAPI) => {
    try {
      const response = await deleteOrganization(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
