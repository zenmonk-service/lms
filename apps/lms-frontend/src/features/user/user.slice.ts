import { createSlice } from "@reduxjs/toolkit";
import { createUserAction } from "./create-user/create-user.action";
import { getOrganizationUserAction } from "./get-organization-user/get-organization-user.action";
import { isUserExistAction } from "./is-user-exist/is-user-exist.action";
import { listUserAction } from "./list-user/list-user.action";
import { updateUserAction } from "./update-user/update-user.action";
import type { UserInterface, UserState } from "./user.type";
import { getUserAction } from "./get-user/get-user.action";
import { generateEmployeeCodeAction } from "./generate-employee-code/generate-employee-code.action";

const initialState: UserState = {
  isLoading: false,
  isLoadingMore: false,
  isExistLoading: false,
  isUserExist: false,
  currentUser: {} as UserInterface,
  users: [],
  count: 0,
  total: 0,
  currentPage: 0,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    search: "",
  },
  selectedUser: null,
  isGeneratingCode: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setPagination: (state, action) => {
      state.pagination = action.payload || initialState.pagination;
    },
    setIsUserExist: (state, action) => {
      state.isUserExist = action.payload || false;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload || null;
    },
    resetUsers: (state) => {
      state.users = [];
      state.total = 0;
      state.currentPage = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listUserAction.pending, (state, action) => {
        const isInfiniteScroll = action.meta.arg.isInfiniteScroll ?? false;

        if (isInfiniteScroll) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }

        state.error = null;
      })

      .addCase(listUserAction.fulfilled, (state, action) => {
        const isInfiniteScroll = action.payload.isInfiniteScroll ?? false;

        if (isInfiniteScroll) {
          state.isLoadingMore = false;

          const newUsers = action.payload.rows || [];
          const existingIds = new Set(state.users.map((u) => u.user_id));

          const uniqueNewUsers = newUsers.filter(
            (u: UserInterface) => !existingIds.has(u.user_id),
          );

          state.users = [...state.users, ...uniqueNewUsers];
        } else {
          state.isLoading = false;

          state.users = action.payload.rows || [];
        }

        state.total = action.payload.total || 0;
        state.count = action.payload.count || 0;
        state.currentPage = action.payload.current_page || 0;
      })

      .addCase(listUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload?.message || "Failed to fetch User";
      })
      .addCase(updateUserAction.pending, (state) => {
        // state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to update user";
      })
      .addCase(isUserExistAction.pending, (state) => {
        state.isExistLoading = true;
        state.error = null;
      })
      .addCase(isUserExistAction.fulfilled, (state, action) => {
        state.isExistLoading = false;
        state.isUserExist = action.payload ? true : false;
      })
      .addCase(isUserExistAction.rejected, (state, action: any) => {
        state.isExistLoading = false;
        state.error =
          action.payload?.message || "Failed to check user existence";
      })
      .addCase(createUserAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserAction.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to create user";
      })
      .addCase(getOrganizationUserAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getOrganizationUserAction.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
        state.isLoading = false;
      })
      .addCase(getOrganizationUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error =
          action.payload?.message || "Failed to fetch organization user";
      })

      .addCase(getUserAction.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(getUserAction.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(generateEmployeeCodeAction.pending, (state) => {
        state.isGeneratingCode = true;
      })
      .addCase(generateEmployeeCodeAction.fulfilled, (state, action) => {
        state.isGeneratingCode = false;
      })
      .addCase(generateEmployeeCodeAction.rejected, (state) => {
        state.isGeneratingCode = false;
      });
  },
});

export const userReducer = userSlice.reducer;
export const { setPagination, setIsUserExist, setCurrentUser, resetUsers } =
  userSlice.actions;
export type {
  PaginationState,
  PersonalInformationInterface,
  SignInInterface,
  UserInterface,
  UserState,
} from "./user.type";
