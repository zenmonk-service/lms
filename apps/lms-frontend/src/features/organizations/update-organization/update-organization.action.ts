import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateOrganizationPayload } from "./update-organization.types";
import { updateOrganization } from "./update-organization.service";

export const updateOrganizationAction = createAsyncThunk(
  "organizations/update",
  async (payload: UpdateOrganizationPayload, thunkAPI) => {
    try {
      const response = await updateOrganization(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);