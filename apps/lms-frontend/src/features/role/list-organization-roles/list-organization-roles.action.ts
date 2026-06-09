import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getOrganizationRoles } from "./list-organization-roles.service";
import { listRolePayload } from "./list-organization-roles.types";

export const getOrganizationRolesAction = createAsyncThunk(
  "roles/get",
  async (payload: listRolePayload, thunkAPI) => {
    try {
      const response = await getOrganizationRoles(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
