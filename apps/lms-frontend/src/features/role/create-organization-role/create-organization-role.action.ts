import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { createOrganizationRole } from "./create-organization-role.service";
import { createRolePayload } from "./create-organization-role.types";
import { RoleActionType } from "../role.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const createOrganizationRoleAction = createAsyncThunk(
  RoleActionType.CREATE_ORGANIZATION_ROLE,
  async (payload: createRolePayload, thunkAPI) => {
    try {
      const response = await createOrganizationRole(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
