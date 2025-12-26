import { createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";
import {
  approveLeaveRequest,
  createUserLeaveRequests,
  deleteLeaveRequest,
  getLeaveRequests,
  getUserLeaveRequest,
  getUserLeaveRequests,
  recommendLeaveRequest,
  rejectLeaveRequest,
  updateLeaveRequest,
} from "./leave-requests.service";
import { toastError } from "@/shared/toast/toast-error";
import { LeaveRequestStatus } from "./leave-requests.types";

export const getLeaveRequestsAction = createAsyncThunk(
  "orgnization/leave-requests",
  async (data: any, thunkAPI) => {
    try {
      const response = await getLeaveRequests(data.org_uuid, data);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const approvableLeaveRequestsAction = createAsyncThunk(
  "orgnization/leave-requests/approvals",
  async (data: any, thunkAPI) => {
    try {
      const { isInfiniteScroll, ...payload } = data || {};
      const response = await getLeaveRequests(payload.org_uuid, payload);
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const getUserLeaveRequestAction = createAsyncThunk(
  "organization/user-leave-request",
  async (data: any, thunkAPI) => {
    try {
      const response = await getUserLeaveRequest(
        data.org_uuid,
        data.user_uuid,
        data.leave_request_uuid
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const getUserLeaveRequestsAction = createAsyncThunk(
  "orgnization/user-leave-requests",
  async (data: any, thunkAPI) => {
    try {
      const response = await getUserLeaveRequests(
        data.org_uuid,
        data.user_uuid,
        data
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const createUserLeaveRequestsAction = createAsyncThunk(
  "orgnization/create-user-leave-requests",
  async (data: any, thunkAPI) => {
    try {
      const response = await createUserLeaveRequests(
        data.org_uuid,
        data.user_uuid,
        data
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const approveLeaveRequestAction = createAsyncThunk(
  "leave-requests/approve",
  async (
    data: {
      org_uuid: string;
      leave_request_uuid: string;
      manager_uuid: string;
      status_changed_to: string;
      remark?: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await approveLeaveRequest(
        data.org_uuid,
        data.leave_request_uuid,
        data.manager_uuid,
        data.status_changed_to,
        data.remark
      );
      if (data.org_uuid) {
        thunkAPI.dispatch(
          getLeaveRequestsAction({
            org_uuid: data.org_uuid,
            manager_uuid: data.manager_uuid,
            page: 1,
            limit: 10,
            search: "",
          } as any)
        );
      }

      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const recommendLeaveRequestAction = createAsyncThunk(
  "leave-requests/recommend",
  async (
    data: {
      org_uuid: string;
      leave_request_uuid: string;
      manager_uuid: string;
      status_changed_to: string;
      remark?: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await recommendLeaveRequest(
        data.org_uuid,
        data.leave_request_uuid,
        data.manager_uuid,
        data.status_changed_to,
        data.remark
      );
      const org_uuid = (thunkAPI.getState() as any).organizationsSlice
        .currentOrganization.uuid;
      if (org_uuid) {
        thunkAPI.dispatch(
          getLeaveRequestsAction({
            org_uuid,
            manager_uuid: data.manager_uuid,
            page: 1,
            limit: 10,
            search: "",
          } as any)
        );
      }
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error.message || "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const rejectLeaveRequestAction = createAsyncThunk(
  "leave-requests/reject",
  async (
    data: {
      org_uuid: string;
      leave_request_uuid: string;
      manager_uuid: string;
      status_changed_to: string;
      remark?: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await rejectLeaveRequest(
        data.org_uuid,
        data.leave_request_uuid,
        data.manager_uuid,
        data.status_changed_to,
        data.remark
      );
      try {
        const org_uuid = (thunkAPI.getState() as any).organizationsSlice
          .currentOrganization.uuid;
        if (org_uuid) {
          thunkAPI.dispatch(
            getLeaveRequestsAction({
              org_uuid,
              manager_uuid: data.manager_uuid,
              page: 1,
              limit: 10,
              search: "",
            } as any)
          );
        }
      } catch (e) {}
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const updateLeaveRequestOfUserAction = createAsyncThunk(
  "user/update-user-leave-requests",
  async (data: any, thunkAPI) => {
    try {
      const response = await updateLeaveRequest(
        data.org_uuid,
        data.user_uuid,
        data.leave_request_uuid,
        data
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);

export const deleteLeaveRequestOfUserAction = createAsyncThunk(
  "user/delete-user-leave-requests",
  async (data: any, thunkAPI) => {
    try {
      const response = await deleteLeaveRequest(
        data.org_uuid,
        data.user_uuid,
        data.leave_request_uuid
      );
      return response.data;
    } catch (err: any) {
      toastError(err.response.data.error ?? "Something went wrong.");
      const error = err as AxiosError;
      return thunkAPI.rejectWithValue(error.response?.data);
    }
  }
);
