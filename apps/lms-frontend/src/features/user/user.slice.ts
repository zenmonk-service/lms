import { createSlice } from "@reduxjs/toolkit";
import {
  createUserAction,
  imageUploadAction,
  isUserExistAction,
  listUserAction,
  updateUserAction,
} from "./user.action";

export interface SignInInterface {
  email: string;
  password: string;
  organization_uuid?: string;
}
export interface UserInterface {
  user_id: string;
  name: string;
  email: string;
  role: {
    id: string;
    uuid: string;
    name: string;
    description: string;
  };
  is_active: boolean;
  created_at: string;
  image?: string;
}

export interface PaginationState {
  page: number;
  limit: number;
  search: string;
}

interface UserCurrentOrganizationInterface {
  uuid: string;
  name: string;
  domain: string;
  logo_url: string | null;
}

type UserState = {
  isLoading: boolean;
  organizations: any[];
  users: UserInterface[];
  pagination: PaginationState;
  total: number;
  currentPage: number;
  error?: string | null;
  isUserExist: boolean;
  currentUser: UserInterface | null ;
  isExistLoading: boolean;
  imageURL : string | null;
};

const initialState: UserState = {
  isLoading: false,
  isExistLoading: false,
  organizations: [],
  isUserExist: false,
  currentUser: null,
  users: [],
  total: 0,
  currentPage: 0,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    search: "",
  },

  imageURL : null,
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
      .addCase(listUserAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listUserAction.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isCurrentUser && action.payload.email) {
          action.payload?.rows?.map((user: UserInterface) => {
            if (user.email === action.payload.email) {
              state.currentUser = user;
            }
          });
        } else {
          const isInfiniteScroll = action.payload.isInfiniteScroll || false;
          const isFirstPage = action.payload.current_page === 1;

          if (isInfiniteScroll) {
            if (isFirstPage) {
              state.users = action.payload.rows || [];
            } else {
              const newUsers = action.payload.rows || [];
              const existingIds = new Set(state.users.map((u) => u.user_id));
              const uniqueNewUsers = newUsers.filter(
                (u: any) => !existingIds.has(u.user_id)
              );
              state.users = [...state.users, ...uniqueNewUsers];
            }
          } else {
            state.users = action.payload.rows || [];
          }

          state.total = action.payload.count || 0;
          state.currentPage = action.payload.current_page || 0;
        }
      })
      .addCase(listUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch User";
      })
      .addCase(updateUserAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserAction.fulfilled, (state, action) => {
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
      .addCase(createUserAction.fulfilled, (state, action) => {
        state.isLoading = false;
      })
      .addCase(createUserAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to create user";
      })
      .addCase(imageUploadAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(imageUploadAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.imageURL = action.payload || null;
      })
      .addCase(imageUploadAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to upload image";
      });
  },
});

export const userReducer = userSlice.reducer;
export const {
  setPagination,
  setIsUserExist,
  setCurrentUser,
  resetUsers,
} = userSlice.actions;
