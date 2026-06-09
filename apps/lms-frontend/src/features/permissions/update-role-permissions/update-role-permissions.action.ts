import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { updateRolePermissions } from "./update-role-permissions.service";
import { updateRolePermission } from "./update-role-permissions.types";

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
  },
);
