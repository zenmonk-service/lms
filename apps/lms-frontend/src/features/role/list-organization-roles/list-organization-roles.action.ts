import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getOrganizationRoles } from "./list-organization-roles.service";
import { listRolePayload } from "./list-organization-roles.types";
import { RoleActionType } from "../role.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const getOrganizationRolesAction = createAsyncThunk(
  RoleActionType.LIST_ORGANIZATION_ROLES,
  async (payload: listRolePayload, thunkAPI) => {
    try {
      const response = await getOrganizationRoles(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
