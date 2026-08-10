import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteOrganizationEventPayload } from "./delete-organization-event.types";
import { deleteOrganizationEvent } from "./delete-organization-event.service";
import { OrganizationActionType } from "../organizations.types";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import { toastSuccess } from "@/shared/toast/toast-success";

export const deleteOrganizationEventAction = createAsyncThunk(
  OrganizationActionType.DELETE_ORGANIZATION_EVENT,
  async (payload: DeleteOrganizationEventPayload, thunkAPI) => {
    try {
      const response = await deleteOrganizationEvent(payload);
      toastSuccess("Event deleted successfully");
      return await response.json();
    } catch (err) {
      const normalized = normalizeApiError(err);
      toastError(normalized.message);
      return thunkAPI.rejectWithValue(normalized);
    }
  },
);
