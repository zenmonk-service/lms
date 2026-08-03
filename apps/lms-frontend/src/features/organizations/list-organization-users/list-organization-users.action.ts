import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { ListOrganizationUsersPayload } from "./list-organization-users.types";
import { listOrganizationUsers } from "./list-organization-users.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listOrganizationUsersAction = createAsyncThunk(
  OrganizationActionType.LIST_ORGANIZATION_USERS,
  async (payload: ListOrganizationUsersPayload, thunkAPI) => {
    try {
      const response = await listOrganizationUsers(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
