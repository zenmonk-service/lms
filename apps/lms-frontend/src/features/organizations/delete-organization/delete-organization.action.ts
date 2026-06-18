import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteOrganizationPayload } from "./delete-organization.types";
import { deleteOrganization } from "./delete-organization.service";
import { OrganizationActionType } from "../organizations.types";

export const deleteOrganizationAction = createAsyncThunk(
  OrganizationActionType.DELETE_ORGANIZATION,
  async (payload: DeleteOrganizationPayload, thunkAPI) => {
    try {
      const response = await deleteOrganization(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);
