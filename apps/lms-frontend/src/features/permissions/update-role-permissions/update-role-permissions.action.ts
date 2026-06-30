import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { updateRolePermissions } from "./update-role-permissions.service";
import { updateRolePermission } from "./update-role-permissions.types";
import { PermissionActionType } from "../permission.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const updateRolePermissionsAction = createAsyncThunk(
  PermissionActionType.UPDATE_ROLE_PERMISSIONS,
  async (payload: updateRolePermission, thunkAPI) => {
    try {
      const response = await updateRolePermissions(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
