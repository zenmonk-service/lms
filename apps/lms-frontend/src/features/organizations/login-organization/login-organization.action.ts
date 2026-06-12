import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginOrganization } from "./login-organization.service";
import { LoginOrganizationPayload } from "./login-organization.types";
import { OrganizationActionType } from "../organizations.types";

export const loginOrganizationAction = createAsyncThunk(
  OrganizationActionType.LOGIN_ORGANIZATION,
  async (payload: LoginOrganizationPayload, thunkAPI) => {
    try {
      const response = await loginOrganization(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);