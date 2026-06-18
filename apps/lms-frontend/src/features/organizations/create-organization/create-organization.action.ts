import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateOrganizationPayload } from "./create-organization.types";
import { createOrganization } from "./create-organization.service";
import { OrganizationActionType } from "../organizations.types";

export const createOrganizationAction = createAsyncThunk(
  OrganizationActionType.CREATE_ORGANIZATION,
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