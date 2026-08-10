import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteOrganizationPayload } from "./delete-organization.types";
import { deleteOrganization } from "./delete-organization.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const deleteOrganizationAction = createAsyncThunk(
  OrganizationActionType.DELETE_ORGANIZATION,
  async (payload: DeleteOrganizationPayload, thunkAPI) => {
    try {
      const response = await deleteOrganization(payload);
      toastSuccess("Organization deleted successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
