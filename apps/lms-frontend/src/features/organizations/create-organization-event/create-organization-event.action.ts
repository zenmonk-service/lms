import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateOrganizationEventPayload } from "./create-organization-event.types";
import { createOrganizationEvent } from "./create-organization-event.service";
import { OrganizationActionType } from "../organizations.types";

export const createOrganizationEventAction = createAsyncThunk(
  OrganizationActionType.CREATE_ORGANIZATION_EVENT,
  async (payload: CreateOrganizationEventPayload, thunkAPI) => {
    try {
      const response = await createOrganizationEvent(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);