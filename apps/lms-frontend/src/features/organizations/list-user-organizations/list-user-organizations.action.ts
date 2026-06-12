import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListUserOrganizationsPayload } from "./list-user-organizations.types";
import { toastError } from "@/shared/toast/toast-error";
import { listUserOrganizations } from "./list-user-organizations.service";
import { OrganizationActionType } from "../organizations.types";

export const listUserOrganizationsAction = createAsyncThunk(
  OrganizationActionType.LIST_USER_ORGANIZATIONS,
  async (payload: ListUserOrganizationsPayload, thunkAPI) => {
    try {
      const response = await listUserOrganizations(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
