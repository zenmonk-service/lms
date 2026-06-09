import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { listRolePermissions } from "./list-role-permissions.service";
import { listRolePermission } from "./list-role-permissions.types";

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
  },
);
