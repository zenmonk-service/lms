import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { createOrganizationRole, getOrganizationRoles } from "./role.service";
import { createRolePayload, listRolePayload } from "./role.type";
import { toastError } from "@/shared/toast/toast-error";

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
  }
);

export const createOrganizationRoleAction = createAsyncThunk(
  "roles/create",
  async (payload: createRolePayload, thunkAPI) => {
    try {
      const response = await createOrganizationRole(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  }
);
