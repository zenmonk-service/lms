export type QueryMessageType = "PUBLIC" | "INTERNAL" | "SYSTEM";

export enum QueryActionType {
  LIST_QUERIES = "query/listQueries",
  GET_QUERY = "query/getQuery",
  CREATE_QUERY = "query/createQuery",
  DELETE_QUERY = "query/deleteQuery",
  CHANGE_QUERY_STATUS = "query/changeQueryStatus",
  CREATE_QUERY_MESSAGE = "query/createQueryMessage",
  UPDATE_QUERY_MESSAGE = "query/updateQueryMessage",
  DELETE_QUERY_MESSAGE = "query/deleteQueryMessage",
  GET_QUERY_MESSAGES = "query/getQueryMessages",
  ADD_QUERY_MEMBER = "query/addQueryMember",
  GET_QUERY_MEMBERS = "query/getQueryMembers",
  REMOVE_QUERY_MEMBER = "query/removeQueryMember",
}

export type QueryStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "PENDING_EMP"
  | "RESOLVED";

export type QueryPriority = "Low" | "Medium" | "High" | "Urgent";

export type QueryModule =
  | "Payroll"
  | "Attendance"
  | "Leave"
  | "IT Assets"
  | "Other";

export interface QueryUserSummary {
  id: number;
  user_id?: string | null;
  name: string;
  email?: string | null;
  image?: string | null;
}

export interface QueryAttachment {
  id: number;
  uuid: string;
  file_name: string;
  file_url: string;
  meta_data?: Record<string, unknown> | null;
}

export interface QueryMessage {
  id: number;
  uuid: string;
  message_type: QueryMessageType;
  content: string;
  created_at: string;
  updated_at?: string;
  sender?: QueryUserSummary | null;
  attachment?: QueryAttachment | null;
}

export interface QueryMember {
  id: number;
  uuid: string;
  role: string;
  assigned_by?: number | null;
  assigned_at?: string;
  user?: QueryUserSummary | null;
  assigner?: QueryUserSummary | null;
}

export interface QueryDetail {
  id: number;
  uuid: string;
  ticket_number: string;
  subject: string;
  description: string;
  module: QueryModule;
  priority: QueryPriority;
  status: QueryStatus;
  assigned_team?: string | null;
  sla_due_at?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at?: string;
  creator?: QueryUserSummary | null;
  members: QueryMember[];
  messages: QueryMessage[];
}

export interface QueryListResponse {
  rows: QueryDetail[];
  total: number;
  count?: number;
  page?: number;
  limit?: number;
}

export interface QueryState {
  queries: QueryDetail[];
  total: number;
  count: number;
  page: number;
  limit: number;
  loading: boolean;
  loadingMore: boolean;
  selectedQuery: QueryDetail | null;
  selectedQueryLoading: boolean;
  messageSendingLoading: boolean;
  selectedQueryMessages: QueryMessage[];
  selectedQueryMessagesLoading: boolean;
  selectedQueryMessagesLoadingMore: boolean;
  selectedQueryMessagesHasMore: boolean;
  selectedQueryMessagesPage: number;
  selectedQueryMessagesLimit: number;
  error: string | null;
}
