import { createSlice } from "@reduxjs/toolkit";
import { getOrganizationRolesAction } from "./list-organization-roles/list-organization-roles.action";
import type { RoleState } from "./role.type";

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
        state.roles = action.payload;
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
export type { Role, RoleState } from "./role.type";
