import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { ListOrganizationUsersPayload } from "./list-organization-users.types";
import { listOrganizationUsers } from "./list-organization-users.service";
import { OrganizationActionType } from "../organizations.types";

export const listOrganizationUsersAction = createAsyncThunk(
  OrganizationActionType.LIST_ORGANIZATION_USERS,
  async (payload: ListOrganizationUsersPayload, thunkAPI) => {
    try {
      const response = await listOrganizationUsers(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);