import { createAsyncThunk } from "@reduxjs/toolkit";
import { toastError } from "@/shared/toast/toast-error";
import { toastSuccess } from "@/shared/toast/toast-success";
import { normalizeApiError } from "@/shared/api-error/normalize-api-error";
import * as service from "./team.service";
import {
  TeamActionType,
  type CreateTeamPayload,
  type TeamPagination,
  type UpdateTeamPayload,
} from "./team.type";

/** Wraps a service call: parses JSON, toasts on success/failure, rejects with the normalized error. */
const run = async <T>(
  thunkAPI: { rejectWithValue: (value: unknown) => any },
  call: () => Promise<Response>,
  successMessage?: string,
): Promise<T> => {
  try {
    const response = await call();
    if (successMessage) toastSuccess(successMessage);
    return (await response.json()) as T;
  } catch (err) {
    const normalized = normalizeApiError(err);
    toastError(normalized.message);
    return thunkAPI.rejectWithValue(normalized);
  }
};

export const listTeamsAction = createAsyncThunk(
  TeamActionType.LIST_TEAMS,
  (payload: { org_uuid: string; pagination: TeamPagination }, thunkAPI) =>
    run<any>(thunkAPI, () =>
      service.listTeams(payload.org_uuid, payload.pagination),
    ),
);

export const listTeamOptionsAction = createAsyncThunk(
  TeamActionType.LIST_TEAM_OPTIONS,
  (payload: { org_uuid: string; search?: string }, thunkAPI) =>
    run<any>(thunkAPI, () =>
      service.listTeamOptions(payload.org_uuid, payload.search),
    ),
);

export const getTeamAction = createAsyncThunk(
  TeamActionType.GET_TEAM,
  (payload: { org_uuid: string; team_uuid: string }, thunkAPI) =>
    run<any>(thunkAPI, () =>
      service.getTeam(payload.org_uuid, payload.team_uuid),
    ),
);

export const createTeamAction = createAsyncThunk(
  TeamActionType.CREATE_TEAM,
  (payload: CreateTeamPayload, thunkAPI) =>
    run<{ uuid: string }>(
      thunkAPI,
      () => service.createTeam(payload),
      "Team created successfully",
    ),
);

export const updateTeamAction = createAsyncThunk(
  TeamActionType.UPDATE_TEAM,
  (payload: UpdateTeamPayload, thunkAPI) =>
    run(thunkAPI, () => service.updateTeam(payload), "Team updated successfully"),
);

export const deleteTeamAction = createAsyncThunk(
  TeamActionType.DELETE_TEAM,
  (payload: { org_uuid: string; team_uuid: string }, thunkAPI) =>
    run(
      thunkAPI,
      () => service.deleteTeam(payload.org_uuid, payload.team_uuid),
      "Team deleted successfully",
    ),
);

export const addTeamMembersAction = createAsyncThunk(
  TeamActionType.ADD_MEMBERS,
  (
    payload: { org_uuid: string; team_uuid: string; user_uuids: string[] },
    thunkAPI,
  ) =>
    run(
      thunkAPI,
      () =>
        service.addTeamMembers(
          payload.org_uuid,
          payload.team_uuid,
          payload.user_uuids,
        ),
      "Members added successfully",
    ),
);

export const removeTeamMemberAction = createAsyncThunk(
  TeamActionType.REMOVE_MEMBER,
  (
    payload: { org_uuid: string; team_uuid: string; user_uuid: string },
    thunkAPI,
  ) =>
    run(
      thunkAPI,
      () =>
        service.removeTeamMember(
          payload.org_uuid,
          payload.team_uuid,
          payload.user_uuid,
        ),
      "Member removed successfully",
    ),
);
