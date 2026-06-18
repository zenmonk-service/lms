import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GetOrganizationPayload } from "./get-organization.types";
import { getOrganization } from "./get-organization.service";
import { OrganizationActionType } from "../organizations.types";

export const getOrganizationAction = createAsyncThunk(
  OrganizationActionType.GET_ORGANIZATION,
  async (payload: GetOrganizationPayload, thunkAPI) => {
    try {
      const response = await getOrganization(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  },
);
