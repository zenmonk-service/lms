export interface TeamUserSummary {
  user_id: string;
  name: string;
  email: string;
  emp_code?: string | null;
  image?: string | null;
  is_active?: boolean;
}

export interface Team {
  uuid: string;
  name: string;
  description: string | null;
  lead: TeamUserSummary | null;
  member_count: number;
  /** List responses only: every member, lead first, then by name. */
  members?: { user_id: string; name: string; is_lead: boolean }[];
  created_at: string;
  updated_at: string;
}

export interface TeamMember extends TeamUserSummary {
  is_lead: boolean;
  role: { uuid: string; name: string } | null;
  /** Who this member reports to within the team. */
  managers: { user_id: string; name: string }[];
}

export interface TeamDetail extends Team {
  members: TeamMember[];
}

/** Minimal team shape returned with `is_filter: true` (all teams, unpaginated). */
export interface TeamOption {
  uuid: string;
  name: string;
  lead: { user_id: string; name: string } | null;
}

export interface TeamRef {
  uuid: string;
  name: string;
}

/** A person on the org graph. */
export interface OrgPerson extends TeamUserSummary {
  role: { uuid: string; name: string } | null;
  teams: TeamRef[];
  /** Distinct people with a reporting line to this person. */
  direct_report_count: number;
}

/** `user_id` reports to `manager_id`, within `team` (null = outside any team). */
export interface OrgLine {
  user_id: string;
  manager_id: string;
  team: TeamRef | null;
}

/** People can have several managers, so the org is a graph, not a tree. */
export interface OrgGraph {
  people: OrgPerson[];
  lines: OrgLine[];
}

/** One of a user's reporting lines, as written to `PUT /users/:uuid/managers`. */
export interface ManagerLineInput {
  manager_uuid: string;
  team_uuid: string | null;
}

/** One of a user's managers, as returned on their profile. */
export interface UserManager {
  user_id: string;
  name: string;
  email: string;
  image: string | null;
  team: TeamRef | null;
}

export interface ManagerChainNode extends OrgPerson {
  level: number;
}

export interface TeamPagination {
  page: number;
  limit: number;
  search: string;
}

export interface TeamState {
  isLoading: boolean;
  isSaving: boolean;
  isDetailLoading: boolean;
  error: string | null;
  teams: Team[];
  count: number;
  total: number;
  pagination: TeamPagination;
  teamOptions: TeamOption[];
  selectedTeam: TeamDetail | null;
}

export interface CreateTeamPayload {
  org_uuid: string;
  name: string;
  description?: string | null;
  lead_uuid?: string | null;
  member_uuids?: string[];
}

export interface UpdateTeamPayload {
  org_uuid: string;
  team_uuid: string;
  name?: string;
  description?: string | null;
  lead_uuid?: string | null;
}

export enum TeamActionType {
  LIST_TEAMS = "teams/listTeams",
  LIST_TEAM_OPTIONS = "teams/listTeamOptions",
  GET_TEAM = "teams/getTeam",
  CREATE_TEAM = "teams/createTeam",
  UPDATE_TEAM = "teams/updateTeam",
  DELETE_TEAM = "teams/deleteTeam",
  ADD_MEMBERS = "teams/addMembers",
  REMOVE_MEMBER = "teams/removeMember",
}
