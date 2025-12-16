import { createSlice } from "@reduxjs/toolkit";
import { getOrganizationRolesAction } from "./role.action";
import { PaginationState } from "../user/user.slice";

export interface Role {
  uuid: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
interface RoleState {
  isLoading: boolean;
  error: string | null;
  roles: Role[];
  total: number;
  currentPage: number;
  pagination: PaginationState;
}

const initialState: RoleState = {
  isLoading: false,
  error: null,
  roles: [],
  total: 0,
  currentPage: 1,
  pagination: {
    page: 1,
    limit: 10,
    search: "",
  },
};

export const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    setPagination: (state, action) => {
      state.pagination = action.payload || initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getOrganizationRolesAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationRolesAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roles = action.payload.rows || [];
        state.total = action.payload.count || 0;
        state.currentPage = action.payload.currentPage || 0;
      })
      .addCase(getOrganizationRolesAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organizations";
      });
  },
});

export const rolesReducer = roleSlice.reducer;
export const { setPagination } = roleSlice.actions;
