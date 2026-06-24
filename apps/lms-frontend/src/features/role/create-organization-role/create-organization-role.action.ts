import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { createOrganizationRole } from "./create-organization-role.service";
import { createRolePayload } from "./create-organization-role.types";
import { RoleActionType } from "../role.type";

export const createOrganizationRoleAction = createAsyncThunk(
   RoleActionType.CREATE_ORGANIZATION_ROLE,
  async (payload: createRolePayload, thunkAPI) => {
    try {
      const response = await createOrganizationRole(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error.detail ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
