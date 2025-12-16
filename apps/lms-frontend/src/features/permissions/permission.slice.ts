import { createSlice } from "@reduxjs/toolkit";
import { PaginationState } from "../user/user.slice";
import {
  listOrganizationPermissionsAction,
  listRolePermissionsAction,
} from "./permission.action";

export interface Permission {
  uuid: string;
  name: string;
  tag: string;
  action: string;
  description: string;
}
interface PermissionState {
  isLoading: boolean;
  error: string | null;
  permissions: Permission[];
  rolePermissions: { role_permissions: Permission[] };
  currentUserRolePermissions: Permission[];
  total: number;
  currentPage: number;
  pagination: PaginationState;
}

const initialState: PermissionState = {
  isLoading: false,
  error: null,
  permissions: [],
  rolePermissions: { role_permissions: [] },
  currentUserRolePermissions: [],
  total: 0,
  currentPage: 1,
  pagination: {
    page: 1,
    limit: 10,
    search: "",
  },
};

export const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    setPagination: (state, action) => {
      state.pagination = action.payload || initialState.pagination;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listOrganizationPermissionsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listOrganizationPermissionsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload || [];
        state.total = action.payload.count || 0;
        state.currentPage = action.payload.currentPage || 0;
      })
      .addCase(
        listOrganizationPermissionsAction.rejected,
        (state, action: any) => {
          state.isLoading = false;
          state.error =
            action.payload?.message || "Failed to fetch permissions";
        }
      )
      .addCase(listRolePermissionsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listRolePermissionsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.currentUserRolePermissions) {
          state.currentUserRolePermissions = action.payload.role_permissions;
        } else {
          state.rolePermissions = action.payload || [];
        }
      })
      .addCase(listRolePermissionsAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch permissions";
      });
  },
});

export const permissionsReducer = permissionSlice.reducer;
export const { setPagination } = permissionSlice.actions;
