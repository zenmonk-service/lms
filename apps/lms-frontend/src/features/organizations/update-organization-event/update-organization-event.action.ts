import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateOrganizationEventPayload } from "./update-organization-event.types";
import { updateOrganizationEvent } from "./update-organization-event.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const updateOrganizationEventAction = createAsyncThunk(
  OrganizationActionType.UPDATE_ORGANIZATION_EVENT,
  async (payload: UpdateOrganizationEventPayload, thunkAPI) => {
    try {
      const response = await updateOrganizationEvent(payload);
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
