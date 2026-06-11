import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateOrganizationPayload } from "./create-organization.types";
import { createOrganization } from "./create-organization.service";

export const createOrganizationAction = createAsyncThunk(
  "organizations/create",
  async (payload: CreateOrganizationPayload, thunkAPI) => {
    try {
      const response = await createOrganization(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);