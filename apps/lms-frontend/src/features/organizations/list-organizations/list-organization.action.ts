import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListOrganizationPayload } from "./list-organization.types";
import { toastError } from "@/shared/toast/toast-error";
import { listOrganizations } from "./list-organization.service";
import { OrganizationActionType } from "../organizations.types";

export const listOrganizationsAction = createAsyncThunk(
  OrganizationActionType.LIST_ORGANIZATIONS,
  async (payload: ListOrganizationPayload, thunkAPI) => {
    try {
      const response = await listOrganizations(payload);
      return response.data
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);