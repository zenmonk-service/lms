import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LeaveRequestFilter, LeaveState } from "./leave.types";
import { listUserLeaveRequestsAction } from "./list-user-leave-requests/list-user-leave-requests.action";
import { getUserLeaveRequestAction } from "./get-user-leave-request/get-user-leave-request.action";
import { createUserLeaveRequestAction } from "./create-user-leave-request/create-user-leave-request.action";
import { deleteUserLeaveRequestAction } from "./delete-user-leave-request/delete-user-leave-request.action";
import { updateUserLeaveRequestAction } from "./update-user-leave-request/update-user-leave-request.action";
import { listLeaveRequestsAction } from "./list-leave-requests/list-leave-request.action";

const initialState: LeaveState = {
  isLoading: false,
  isLoadingMore: false,
  userLeaveRequests: { rows: [], count: 0, current_page: 0, total: 0 },
  leaveRequests: { rows: [], count: 0, current_page: 0, total: 0 },
  selectedLeaveRequest: undefined,
  selectedLeaveRequestDetails: undefined,
  isSelectedLeaveRequestLoading: false,
  leaveRequestFilter: {
    pagination: {
      page: 1,
      limit: 10,
    }
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
      state.leaveRequestFilter = { ...state.leaveRequestFilter, ...action.payload };
    },
    resetLeaveRequestFilter: (state) => {
      state.leaveRequestFilter = {
        pagination: {
          page: 1,
          limit: 10,
        }
      };
    }
  },
  extraReducers: (builder) => {
    builder

      /**
       * @description
       * Handles All the requests related to leave requests.
       */
      .addCase(listLeaveRequestsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(listLeaveRequestsAction.fulfilled, (state, action) => {
        state.isLoading = false;
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

      .addCase(listUserLeaveRequestsAction.pending, (state, action) => {
        const current_page = action?.meta?.arg?.params?.page || 1;
        if (current_page === 1) {
          state.isLoading = true;
        } else {
          state.isLoadingMore = true;
        }
      })
      .addCase(listUserLeaveRequestsAction.fulfilled, (state, action) => {
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
      .addCase(listUserLeaveRequestsAction.rejected, (state, action) => {
        const current_page = action?.meta?.arg?.params?.page || 1;
        if (current_page === 1) {
          state.isLoading = false;
        } else {
          state.isLoadingMore = false;
        }
      })

      .addCase(createUserLeaveRequestAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createUserLeaveRequestAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createUserLeaveRequestAction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(deleteUserLeaveRequestAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteUserLeaveRequestAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteUserLeaveRequestAction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(updateUserLeaveRequestAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateUserLeaveRequestAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserLeaveRequestAction.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setLeaveRequestFilter, resetLeaveRequestFilter } = leaveSlice.actions;
export default leaveSlice.reducer;
