import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LeaveRequestFilter, LeaveState } from "./leave.types";
import { listUserLeaveRequestsAction } from "./list-user-leave-requests/list-user-leave-requests.action";
import { getUserLeaveRequestAction } from "./get-user-leave-request/get-user-leave-request.action";
import { createUserLeaveRequestAction } from "./create-user-leave-request/create-user-leave-request.action";
import { deleteUserLeaveRequestAction } from "./delete-user-leave-request/delete-user-leave-request.action";
import { updateUserLeaveRequestAction } from "./update-user-leave-request/update-user-leave-request.action";
import { listLeaveRequestsAction } from "./list-leave-requests/list-leave-request.action";
import { listLeaveTypesAction } from "./list-leave-types/list-leave-types.action";
import { createLeaveTypeAction } from "./create-leave-type/create-leave-type.action";
import { activateLeaveTypeAction } from "./activate-leave-type/activate-leave-type.action";
import { deactivateLeaveTypeAction } from "./deactivate-leave-type/deactivate-leave-type.action";
import { listUserLeaveBalancesAction } from "./list-user-leave-balance/list-user-leave-balance.action";

const initialState: LeaveState = {
  leaveTypesLoading: false,
  leaveRequestsLoading: false,
  leaveRequestsMoreLoading: false,
  userLeaveRequestsLoading: false,
  userLeaveRequestsMoreLoading: false,
  leaveBalancesLoading: false,

  userLeaveRequests: { rows: [], count: 0, current_page: 0, total: 0 },
  leaveRequests: { rows: [], count: 0, current_page: 0, total: 0 },
  selectedLeaveRequest: undefined,
  selectedLeaveRequestDetails: undefined,
  isSelectedLeaveRequestLoading: false,
  leaveRequestFilter: {
    pagination: {
      page: 1,
      limit: 10,
    },
  },

  userLeaveBalances: [],

  leaveTypes: {
    count: 0,
    rows: [],
    current_page: 1,
    per_page: 10,
    total: 0,
  },
};

const leaveSlice = createSlice({
  name: "leave",
  initialState,
  reducers: {
    setLeaveRequestFilter: (
      state,
      action: PayloadAction<LeaveRequestFilter | undefined>,
    ) => {
      state.leaveRequestFilter = {
        ...state.leaveRequestFilter,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(listUserLeaveBalancesAction.pending, (state) => {
        state.leaveBalancesLoading = true;
      })
      .addCase(listUserLeaveBalancesAction.fulfilled, (state, action) => {
        state.leaveBalancesLoading = false;
        state.userLeaveBalances = action.payload;
      })
      .addCase(listUserLeaveBalancesAction.rejected, (state) => {
        state.leaveBalancesLoading = false;
      })

      .addCase(listLeaveTypesAction.pending, (state) => {
        state.leaveTypesLoading = true;
      })
      .addCase(listLeaveTypesAction.fulfilled, (state, action) => {
        state.leaveTypesLoading = false;
        state.leaveTypes = action.payload;
      })
      .addCase(listLeaveTypesAction.rejected, (state) => {
        state.leaveTypesLoading = false;
      })

      .addCase(createLeaveTypeAction.pending, (state) => {
        state.leaveTypesLoading = true;
      })
      .addCase(createLeaveTypeAction.fulfilled, (state) => {
        state.leaveTypesLoading = false;
      })
      .addCase(createLeaveTypeAction.rejected, (state) => {
        state.leaveTypesLoading = false;
      })

      .addCase(activateLeaveTypeAction.pending, (state) => {
        state.leaveTypesLoading = true;
      })
      .addCase(activateLeaveTypeAction.fulfilled, (state) => {
        state.leaveTypesLoading = false;
      })
      .addCase(activateLeaveTypeAction.rejected, (state) => {
        state.leaveTypesLoading = false;
      })

      .addCase(deactivateLeaveTypeAction.pending, (state) => {
        state.leaveTypesLoading = true;
      })
      .addCase(deactivateLeaveTypeAction.fulfilled, (state) => {
        state.leaveTypesLoading = false;
      })
      .addCase(deactivateLeaveTypeAction.rejected, (state) => {
        state.leaveTypesLoading = false;
      })

      .addCase(listLeaveRequestsAction.pending, (state) => {
        state.leaveRequestsLoading = true;
      })
      .addCase(listLeaveRequestsAction.fulfilled, (state, action) => {
        state.leaveRequestsLoading = false;
        const isInfiniteScroll =
          action?.meta?.arg?.params?.isInfiniteScroll || false;
        const currentPageFromApi = action.payload?.current_page ?? 1;
        const isFirstPage = currentPageFromApi === 1;

        if (action.payload) {
          if (isInfiniteScroll) {
            if (isFirstPage) {
              state.leaveRequests = {
                rows: action.payload.rows || [],
                count: action.payload.count || 0,
                current_page: currentPageFromApi,
                total: action.payload.total || 0,
              };
            } else {
              const newRows = action.payload.rows || [];
              const existingIds = new Set(
                state.leaveRequests.rows.map((r) => r.uuid),
              );
              const uniqueNewRows = newRows.filter(
                (r: any) => !existingIds.has(r.uuid),
              );
              state.leaveRequests.rows = [
                ...state.leaveRequests.rows,
                ...uniqueNewRows,
              ];
              state.leaveRequests.count = action.payload.count || 0;
              state.leaveRequests.current_page = currentPageFromApi;
            }
          } else {
            state.leaveRequests = {
              rows: action.payload.rows || [],
              count: action.payload.count || 0,
              current_page: currentPageFromApi,
              total: action.payload.total || 0,
            };
          }
        } else {
          state.leaveRequests = {
            rows: [],
            count: 0,
            current_page: 0,
            total: 0,
          };
        }
      })
      .addCase(listLeaveRequestsAction.rejected, (state) => {
        state.leaveRequestsLoading = false;
      })

      .addCase(getUserLeaveRequestAction.pending, (state) => {
        state.leaveRequestsLoading = true;
      })
      .addCase(getUserLeaveRequestAction.fulfilled, (state, action) => {
        state.leaveRequestsLoading = false;
        state.selectedLeaveRequest = action.payload;
      })
      .addCase(getUserLeaveRequestAction.rejected, (state) => {
        state.leaveRequestsLoading = false;
      })

      .addCase(listUserLeaveRequestsAction.pending, (state, action) => {
        const current_page = action?.meta?.arg?.params?.page || 1;
        if (current_page === 1) {
          state.userLeaveRequestsLoading = true;
        } else {
          state.userLeaveRequestsMoreLoading = true;
        }
      })
      .addCase(listUserLeaveRequestsAction.fulfilled, (state, action) => {
        state.userLeaveRequestsLoading = false;
        state.userLeaveRequestsMoreLoading = false;
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
      .addCase(listUserLeaveRequestsAction.rejected, (state, action) => {
        const current_page = action?.meta?.arg?.params?.page || 1;
        if (current_page === 1) {
          state.userLeaveRequestsLoading = false;
        } else {
          state.userLeaveRequestsMoreLoading = false;
        }
      })

      .addCase(createUserLeaveRequestAction.pending, (state) => {
        state.leaveRequestsLoading = true;
      })
      .addCase(createUserLeaveRequestAction.fulfilled, (state) => {
        state.leaveRequestsLoading = false;
      })
      .addCase(createUserLeaveRequestAction.rejected, (state) => {
        state.leaveRequestsLoading = false;
      })

      .addCase(deleteUserLeaveRequestAction.pending, (state) => {
        state.leaveRequestsLoading = true;
      })
      .addCase(deleteUserLeaveRequestAction.fulfilled, (state) => {
        state.leaveRequestsLoading = false;
      })
      .addCase(deleteUserLeaveRequestAction.rejected, (state) => {
        state.leaveRequestsLoading = false;
      })

      .addCase(updateUserLeaveRequestAction.pending, (state) => {
        state.leaveRequestsLoading = true;
      })
      .addCase(updateUserLeaveRequestAction.fulfilled, (state) => {
        state.leaveRequestsLoading = false;
      })
      .addCase(updateUserLeaveRequestAction.rejected, (state) => {
        state.leaveRequestsLoading = false;
      });
  },
});

export const { setLeaveRequestFilter } = leaveSlice.actions;
export const leaveReducer = leaveSlice.reducer;
