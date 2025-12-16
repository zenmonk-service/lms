import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  listPermissionPayload,
  listRolePermission,
  updateRolePermission,
} from "./permission.type";
import {
  listOrganizationPermissions,
  listRolePermissions,
  updateRolePermissions,
} from "./permission.service";
import { toastError } from "@/shared/toast/toast-error";

export const listOrganizationPermissionsAction = createAsyncThunk(
  "permissions/list",
  async (payload: listPermissionPayload, thunkAPI) => {
    try {
      const response = await listOrganizationPermissions(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const listRolePermissionsAction = createAsyncThunk(
  "/role-permissions/list",
  async (payload: listRolePermission, thunkAPI) => {
    try {
      const response = await listRolePermissions(payload);
      return {
        ...response.data,
        currentUserRolePermissions:
          payload.isCurrentUserRolePermissions ?? false,
      };
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);

export const updateRolePermissionsAction = createAsyncThunk(
  "/role-permissions/update",
  async (payload: updateRolePermission, thunkAPI) => {
    try {
      const response = await updateRolePermissions(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
