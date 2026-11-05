import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { TeamState } from "./team.type";
import {
  addTeamMembersAction,
  createTeamAction,
  deleteTeamAction,
  getTeamAction,
  listTeamOptionsAction,
  listTeamsAction,
  removeTeamMemberAction,
  updateTeamAction,
} from "./team.action";

const initialState: TeamState = {
  isLoading: false,
  isSaving: false,
  isDetailLoading: false,
  error: null,
  teams: [],
  count: 0,
  total: 0,
  pagination: { page: 1, limit: 10, search: "" },
  teamOptions: [],
  selectedTeam: null,
};

const mutations = [
  createTeamAction,
  updateTeamAction,
  deleteTeamAction,
  addTeamMembersAction,
  removeTeamMemberAction,
] as const;

export const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    setTeamPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
    clearSelectedTeam: (state) => {
      state.selectedTeam = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listTeamsAction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(listTeamsAction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teams = action.payload.rows || [];
        state.count = action.payload.count || 0;
        state.total = action.payload.total || 0;
      })
      .addCase(listTeamsAction.rejected, (state, action: any) => {
        state.isLoading = false;
        state.error = action.payload?.message || "Failed to fetch teams";
      })
      .addCase(listTeamOptionsAction.fulfilled, (state, action) => {
        state.teamOptions = action.payload || [];
      })
      .addCase(getTeamAction.pending, (state) => {
        state.isDetailLoading = true;
      })
      .addCase(getTeamAction.fulfilled, (state, action) => {
        state.isDetailLoading = false;
        state.selectedTeam = action.payload;
      })
      .addCase(getTeamAction.rejected, (state) => {
        state.isDetailLoading = false;
        state.selectedTeam = null;
      })
      .addMatcher(isAnyOf(...mutations.map((m) => m.pending)), (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addMatcher(isAnyOf(...mutations.map((m) => m.fulfilled)), (state) => {
        state.isSaving = false;
      })
      .addMatcher(
        isAnyOf(...mutations.map((m) => m.rejected)),
        (state, action: any) => {
          state.isSaving = false;
          state.error = action.payload?.message || "Request failed";
        },
      );
  },
});

export const teamsReducer = teamSlice.reducer;
export const { setTeamPagination, clearSelectedTeam } = teamSlice.actions;
