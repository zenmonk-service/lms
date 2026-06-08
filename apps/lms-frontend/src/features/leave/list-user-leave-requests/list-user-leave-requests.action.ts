import { toastError } from "@/shared/toast/toast-error";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { listUserLeaveRequests } from "./list-user-leave-requests.service";
import { ListUserLeaveRequestsPayload } from "./list-user-leave-requests.types";

export const listUserLeaveRequestsAction = createAsyncThunk(
  "orgnization/user-leave-requests",
  async (data: ListUserLeaveRequestsPayload, thunkAPI) => {
    const { pagination, ...filters } = data.params || {};
    try {
      const response = await listUserLeaveRequests(
        data.org_uuid,
        data.user_uuid,
        { ...filters, ...pagination }
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      return thunkAPI.rejectWithValue(err.response?.data);
    }
  }
);