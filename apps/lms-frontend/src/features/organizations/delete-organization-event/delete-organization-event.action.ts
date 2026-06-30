import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteOrganizationEventPayload } from "./delete-organization-event.types";
import { deleteOrganizationEvent } from "./delete-organization-event.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";

export const deleteOrganizationEventAction = createAsyncThunk(
  OrganizationActionType.DELETE_ORGANIZATION_EVENT,
  async (payload: DeleteOrganizationEventPayload, thunkAPI) => {
    try {
      const response = await deleteOrganizationEvent(payload);
      return response.data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
