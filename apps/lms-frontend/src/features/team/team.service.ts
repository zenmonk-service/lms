import { bffClient } from "@/config/client";
import type {
  CreateTeamPayload,
  ManagerLineInput,
  TeamPagination,
  UpdateTeamPayload,
} from "./team.type";

export const listTeams = (org_uuid: string, pagination: TeamPagination) =>
  bffClient.get(`/teams`, {
    params: { ...pagination },
    headers: { org_uuid, is_filter: "false" },
  });

export const listTeamOptions = (org_uuid: string, search = "") =>
  bffClient.get(`/teams`, {
    params: { search },
    headers: { org_uuid, is_filter: "true" },
  });

export const getTeam = (org_uuid: string, team_uuid: string) =>
  bffClient.get(`/teams/${team_uuid}`, { headers: { org_uuid } });

export const createTeam = ({ org_uuid, ...body }: CreateTeamPayload) =>
  bffClient.post(`/teams`, body, { headers: { org_uuid } });

export const updateTeam = ({ org_uuid, team_uuid, ...body }: UpdateTeamPayload) =>
  bffClient.put(`/teams/${team_uuid}`, body, { headers: { org_uuid } });

export const deleteTeam = (org_uuid: string, team_uuid: string) =>
  bffClient.delete(`/teams/${team_uuid}`, { headers: { org_uuid } });

export const addTeamMembers = (
  org_uuid: string,
  team_uuid: string,
  user_uuids: string[],
) =>
  bffClient.post(
    `/teams/${team_uuid}/members`,
    { user_uuids },
    { headers: { org_uuid } },
  );

export const removeTeamMember = (
  org_uuid: string,
  team_uuid: string,
  user_uuid: string,
) =>
  bffClient.delete(`/teams/${team_uuid}/members/${user_uuid}`, {
    headers: { org_uuid },
  });

export const getHierarchy = (
  org_uuid: string,
  params: { root_uuid?: string; team_uuid?: string } = {},
) =>
  bffClient.get(`/users/hierarchy`, {
    params,
    headers: { org_uuid },
  });

export const getManagerChain = (org_uuid: string, user_uuid: string) =>
  bffClient.get(`/users/${user_uuid}/chain`, { headers: { org_uuid } });

/** Replaces all of `user_uuid`'s reporting lines; an empty list makes them top-level. */
export const setManagers = (
  org_uuid: string,
  user_uuid: string,
  managers: ManagerLineInput[],
) =>
  bffClient.put(
    `/users/${user_uuid}/managers`,
    { managers },
    { headers: { org_uuid } },
  );

/** Replaces a user's team memberships. */
export const setUserTeams = (
  org_uuid: string,
  user_uuid: string,
  team_uuids: string[],
) =>
  bffClient.put(`/users/${user_uuid}`, { team_uuids }, { headers: { org_uuid } });
