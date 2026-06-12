import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateOrganizationEventPayload } from "./update-organization-event.types";
import { updateOrganizationEvent } from "./update-organization-event.service";
import { OrganizationActionType } from "../organizations.types";

export const updateOrganizationEventAction = createAsyncThunk(
  OrganizationActionType.UPDATE_ORGANIZATION_EVENT,
  async (payload: UpdateOrganizationEventPayload, thunkAPI) => {
    try {
      const response = await updateOrganizationEvent(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);