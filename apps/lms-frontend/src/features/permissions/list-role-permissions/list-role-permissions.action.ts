import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listRolePermissions } from "./list-role-permissions.service";
import { listRolePermission } from "./list-role-permissions.types";
import { PermissionActionType } from "../permission.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listRolePermissionsAction = createAsyncThunk(
  PermissionActionType.LIST_ROLE_PERMISSIONS,
  async (payload: listRolePermission, thunkAPI) => {
    try {
      const response = await listRolePermissions(payload);
      return {
        ...await response.json(),
        currentUserRolePermissions:
          payload.isCurrentUserRolePermissions ?? false,
      };
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
