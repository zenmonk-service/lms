import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";

import { RoleActionType } from "../role.type";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { UpdateRolePayload } from "./update-role.type";
import { updateOrganizationRole } from "./update-role.service";

export const updateOrganizationRoleAction = createAsyncThunk(
  RoleActionType.UPDATE_ORGANIZATION_ROLE,
  async (payload: UpdateRolePayload, thunkAPI) => {
    try {
      const response = await updateOrganizationRole(payload);
      toastSuccess("Role updated successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
