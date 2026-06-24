import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { listOrganizationPermissions } from "./list-organization-permissions.service";
import { listPermissionPayload } from "./list-organization-permissions.types";
import { PermissionActionType } from "../permission.type";

export const listOrganizationPermissionsAction = createAsyncThunk(
  PermissionActionType.LIST_ORGANIZATION_PERMISSIONS,
  async (payload: listPermissionPayload, thunkAPI) => {
    try {
      const response = await listOrganizationPermissions(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
