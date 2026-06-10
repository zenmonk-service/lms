import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { updateRolePermissions } from "./update-role-permissions.service";
import { updateRolePermission } from "./update-role-permissions.types";
import { PermissionActionType } from "../permission.type";

export const updateRolePermissionsAction = createAsyncThunk(
  PermissionActionType.UPDATE_ROLE_PERMISSIONS,
  async (payload: updateRolePermission, thunkAPI) => {
    try {
      const response = await updateRolePermissions(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
