import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ListOrganizationEventsPayload } from "./list-organization-events.types";
import { listOrganizationEvents } from "./list-organization-events.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const listOrganizationEventsAction = createAsyncThunk(
  OrganizationActionType.LIST_ORGANIZATION_EVENTS,
  async (payload: ListOrganizationEventsPayload, thunkAPI) => {
    try {
      const response = await listOrganizationEvents(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
