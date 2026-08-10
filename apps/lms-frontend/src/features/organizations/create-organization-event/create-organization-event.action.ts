import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { CreateOrganizationEventPayload } from "./create-organization-event.types";
import { createOrganizationEvent } from "./create-organization-event.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const createOrganizationEventAction = createAsyncThunk(
  OrganizationActionType.CREATE_ORGANIZATION_EVENT,
  async (payload: CreateOrganizationEventPayload, thunkAPI) => {
    try {
      const response = await createOrganizationEvent(payload);
      toastSuccess("Event created successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
