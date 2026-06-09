import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import { getOrganizationUser } from "./get-organization-user.service";
import { GetOrganizationUserPayload } from "./get-organization-user.types";

export const getOrganizationUserAction = createAsyncThunk(
  "user/organization/get",
  async (payload: GetOrganizationUserPayload, thunkAPI) => {
    try {
      const response = await getOrganizationUser(
        payload.user_uuid,
        payload.org_uuid,
      );
      return response.data;
    } catch (err: any) {
      toastError(
        err.response?.data?.error ?? "Failed to fetch organization user.",
      );
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error?.response?.data);
    }
  },
);
