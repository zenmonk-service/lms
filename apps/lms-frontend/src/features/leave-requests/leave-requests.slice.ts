import { createSlice } from "@reduxjs/toolkit";
import {
  createUserLeaveRequestsAction,
  getUserLeaveRequestsAction,
  getLeaveRequestsAction,
  deleteLeaveRequestOfUserAction,
  updateLeaveRequestOfUserAction,
  approvableLeaveRequestsAction,
} from "./leave-requests.action";
import { LeaveRequestStatus } from "./leave-requests.types";

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
  managers: {
    remarks: string;
    user: {
      user_id: string;
      name: string;
      email: string;
    };
  }[];
}
interface LeaveRequest {
  count: number;
  rows: Row[];
}

interface LeaveRequestState {
  isLoading: boolean;
  userLeaveRequests: LeaveRequest;
  approvableLeaveRequests: LeaveRequest;
}

const initialState: LeaveRequestState = {
  isLoading: false,
  userLeaveRequests: { rows: [], count: 0 },
  approvableLeaveRequests: { rows: [], count: 0 },
};

const leaveRequestSlice = createSlice({
  name: "leave-requests",
  initialState,
  reducers: {
    resetLeaveRequestState: () => initialState,
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
        state.approvableLeaveRequests = action.payload ?? { rows: [], count: 0 };
      })
      .addCase(approvableLeaveRequestsAction.rejected, (state) => {
        state.isLoading = false;
      })

      .addCase(getUserLeaveRequestsAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserLeaveRequestsAction.fulfilled, (state, action) => {
        // if(action.payload.isManager){
        //    state.userLeaveApproval = action.payload;
        // }
        state.isLoading = false;
        state.userLeaveRequests = action.payload;
      })
      .addCase(getUserLeaveRequestsAction.rejected, (state) => {
        state.isLoading = false;
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

export const { resetLeaveRequestState } =
  leaveRequestSlice.actions;

export default leaveRequestSlice.reducer;
