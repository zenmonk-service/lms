import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listOrganizationPermissions } from "./list-organization-permissions.service";
import { listPermissionPayload } from "./list-organization-permissions.types";
import { PermissionActionType } from "../permission.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listOrganizationPermissionsAction = createAsyncThunk(
  PermissionActionType.LIST_ORGANIZATION_PERMISSIONS,
  async (payload: listPermissionPayload, thunkAPI) => {
    try {
      const response = await listOrganizationPermissions(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
