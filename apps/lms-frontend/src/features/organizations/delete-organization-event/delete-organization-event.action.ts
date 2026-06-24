import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { DeleteOrganizationEventPayload } from "./delete-organization-event.types";
import { deleteOrganizationEvent } from "./delete-organization-event.service";

export const deleteOrganizationEventAction = createAsyncThunk(
  "organizations/delete-event",
  async (payload: DeleteOrganizationEventPayload, thunkAPI) => {
    try {
      const response = await deleteOrganizationEvent(payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);