import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListOrganizationPayload } from "./list-organization.types";
import { toastError } from "@/shared/toast/toast-error";
import { listOrganizations } from "./lsit-organization.service";

export const listOrganizationsAction = createAsyncThunk(
  "organizations/getAll",
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