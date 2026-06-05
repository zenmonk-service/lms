import { createSlice } from "@reduxjs/toolkit";
import {
  createUserLeaveRequestsAction,
  getUserLeaveRequestsAction,
  getLeaveRequestsAction,
  deleteLeaveRequestOfUserAction,
  updateLeaveRequestOfUserAction,
  approvableLeaveRequestsAction,
  getUserLeaveRequestAction,
} from "./leave-requests.action";
import { LeaveRequestStatus } from "./leave-requests.types";

interface Managers {
  remarks: string;
  status_changed_to: LeaveRequestStatus | null;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: {
      name: string;
      uuid: string;
    };
  };
}

interface Row {
  uuid: string;
  start_date: string;
  end_date: string;
  type: string;
  range: string;
  leave_duration: string;
  reason: string;
  status: LeaveRequestStatus;
  leave_type: {
    name: string;
    uuid: string;
  };
  managers: Managers[];
  effective_days: string;
}
interface LeaveRequest {
  count: number;
  current_page?: number;
  total?: number;
  rows: Row[];
}

interface LeaveFilters {
  pagination?: {
    page: number;
    limit: number;
  };
  status?: LeaveRequestStatus;
  date_range?: [string, string];
  date?: string;
  leave_type_uuid?: string;
  user_uuid?: string;
}

interface LeaveBalance {
  balance: string;
  leaves_allocated: number;
  period: string;
}
interface LeaveType {
  name: string;
  uuid: string;
  leave_balances: LeaveBalance[];
}

interface SelectedLeave {
  uuid: string;
  status_changed_by: [{ user_id: string }] | null;
  leave_type: LeaveType;
  leave_duration: number;
  managers: Managers[];
  reason: string | null;
  status: LeaveRequestStatus;
  type: string;
  range: string;
  start_date: string;
  end_date: string;
  created_at: string;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: {
      name: string;
      uuid: string;
    };
  };
}

interface LeaveRequestState {
  isLoading: boolean;
  isLoadingMore: boolean;
  userLeaveRequests: LeaveRequest;
  approvableLeaveRequests: LeaveRequest;
  selectedLeaveRequestDetails?: {
    leave_uuid?: string;
    user?: {
      user_id: string;
      name: string;
      email: string;
      role: {
        name: string;
      };
      phone_number: string;
    };
  };
  selectedLeaveRequest?: SelectedLeave;
  isSelectedLeaveRequestLoading: boolean;
  leaveFilters?: LeaveFilters;
}

const initialState: LeaveRequestState = {
  isLoading: false,
  isLoadingMore: false,
  userLeaveRequests: { rows: [], count: 0 },
  approvableLeaveRequests: { rows: [], count: 0, current_page: 0 },
  selectedLeaveRequest: undefined,
  selectedLeaveRequestDetails: undefined,
  isSelectedLeaveRequestLoading: false,
  leaveFilters: undefined,
};

const leaveRequestSlice = createSlice({
  name: "leave-requests",
  initialState,
  reducers: {
    setLeaveFilters: (state, action) => {
      state.leaveFilters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeaveRequestsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeaveRequestsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userLeaveRequests = action.payload ?? { rows: [], count: 0 };
      })
      .addCase(getLeaveRequestsAction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(approvableLeaveRequestsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approvableLeaveRequestsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        const isInfiniteScroll = action?.meta?.arg?.isInfiniteScroll || false;
        const currentPageFromApi = action.payload?.current_page ?? 1;
        const isFirstPage = currentPageFromApi === 1;

        if (action.payload) {
          if (isInfiniteScroll) {
            if (isFirstPage) {
              state.approvableLeaveRequests = {
                rows: action.payload.rows || [],
                count: action.payload.count || 0,
                current_page: currentPageFromApi,
              };
            } else {
              const newRows = action.payload.rows || [];
              const existingIds = new Set(
                state.approvableLeaveRequests.rows.map((r) => r.uuid),
              );
              const uniqueNewRows = newRows.filter(
                (r: any) => !existingIds.has(r.uuid),
              );
              state.approvableLeaveRequests.rows = [
                ...state.approvableLeaveRequests.rows,
                ...uniqueNewRows,
              ];
              state.approvableLeaveRequests.count = action.payload.count || 0;
              state.approvableLeaveRequests.current_page = currentPageFromApi;
            }
          } else {
            state.approvableLeaveRequests = {
              rows: action.payload.rows || [],
              count: action.payload.count || 0,
              current_page: currentPageFromApi,
            };
          }
        } else {
          state.approvableLeaveRequests = {
            rows: [],
            count: 0,
            current_page: 0,
          };
        }
      })
      .addCase(approvableLeaveRequestsAction.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getUserLeaveRequestAction.pending, (state) => {
        state.isSelectedLeaveRequestLoading = true;
      })
      .addCase(getUserLeaveRequestAction.fulfilled, (state, action) => {
        state.isSelectedLeaveRequestLoading = false;
        state.selectedLeaveRequest = action.payload;
      })
      .addCase(getUserLeaveRequestAction.rejected, (state) => {
        state.isSelectedLeaveRequestLoading = false;
      })
      .addCase(getUserLeaveRequestsAction.pending, (state, action) => {
        const current_page = action?.meta?.arg?.page || 1;
        if (current_page === 1) {
          state.isLoading = true;
        } else {
          state.isLoadingMore = true;
        }
      })
      .addCase(getUserLeaveRequestsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        const current_page = action.payload.current_page || 1;
        if (current_page === 1) {
          state.userLeaveRequests = action.payload;
        } else {
          const newRows = action.payload.rows || [];
          const existingIds = new Set(
            state.userLeaveRequests.rows.map((r) => r.uuid),
          );
          const uniqueNewRows = newRows.filter(
            (r: any) => !existingIds.has(r.uuid),
          );

          state.userLeaveRequests.rows = [
            ...state.userLeaveRequests.rows,
            ...uniqueNewRows,
          ];
          state.userLeaveRequests.count = action.payload.count || 0;
          state.userLeaveRequests.current_page = current_page;
          state.userLeaveRequests.total = action.payload.total;
        }
      })
      .addCase(getUserLeaveRequestsAction.rejected, (state, action) => {
        const current_page = action?.meta?.arg?.page || 1;
        if (current_page === 1) {
          state.isLoading = false;
        } else {
          state.isLoadingMore = false;
        }
      })
      .addCase(createUserLeaveRequestsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUserLeaveRequestsAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createUserLeaveRequestsAction.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteLeaveRequestOfUserAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteLeaveRequestOfUserAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteLeaveRequestOfUserAction.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateLeaveRequestOfUserAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateLeaveRequestOfUserAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateLeaveRequestOfUserAction.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setLeaveFilters } = leaveRequestSlice.actions;

export default leaveRequestSlice.reducer;
