import { createSlice, isAnyOf, PayloadAction } from "@reduxjs/toolkit";
import { listQueriesAction } from "./list-queries/list-queries.action";
import { ListQueriesParams } from "./list-queries/list-queries.types";
import { getQueryAction } from "./get-query/get-query.action";
import { createQueryAction } from "./create-query/create-query.action";
import { deleteQueryAction } from "./delete-query/delete-query.action";
import { changeQueryStatusAction } from "./change-query-status/change-query-status.action";
import { createQueryMessageAction } from "./create-query-message/create-query-message.action";
import { updateQueryMessageAction } from "./update-query-message/update-query-message.action";
import { deleteQueryMessageAction } from "./delete-query-message/delete-query-message.action";
import { addQueryMemberAction } from "./add-query-member/add-query-member.action";
import { removeQueryMemberAction } from "./remove-query-member/remove-query-member.action";
import { getQueryMessagesAction } from "./get-query-messages/get-query-messages.action";
import { GetQueryMessagesResponse } from "./get-query-messages/get-query-messages.types";
import {
  QueryDetail,
  QueryMember,
  QueryMembersChangedEvent,
  QueryMessage,
  QueryState,
  QueryStatusChangeEvent,
} from "./query.types";

/* ---------------------------------- Helpers --------------------------------- */

const sortMessagesByCreatedAt = (items: QueryMessage[]) =>
  [...items].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

/** Adds `incoming` items whose uuid isn't already present (pages can overlap after realtime inserts). */
const mergeUniqueByUuid = <T extends { uuid: string }>(
  existing: T[],
  incoming: T[],
) => {
  const known = new Set(existing.map((item) => item.uuid));
  return incoming.filter((item) => !known.has(item.uuid));
};

const rowsOf = <T>(payload: { rows?: T[] } | undefined): T[] =>
  Array.isArray(payload?.rows) ? payload.rows : [];

/** Rejected thunks carry a NormalizedApiError (or occasionally a string). */
const errorMessageOf = (payload: unknown, fallback: string) => {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && "message" in payload) {
    const { message } = payload as { message?: unknown };
    if (typeof message === "string" && message) return message;
  }
  return fallback;
};

const isSelectedQuery = (state: QueryState, queryUuid?: string) =>
  Boolean(queryUuid) && state.selectedQuery?.uuid === queryUuid;

/**
 * Insert or replace a message by uuid. Every realtime event and every API response
 * goes through here, so applying the same event twice (own echo + response) is harmless.
 */
const upsertMessage = (state: QueryState, message: QueryMessage) => {
  const index = state.selectedQueryMessages.findIndex(
    (item) => item.uuid === message.uuid,
  );
  if (index === -1) {
    state.selectedQueryMessages = sortMessagesByCreatedAt([
      ...state.selectedQueryMessages,
      message,
    ]);
    return;
  }
  state.selectedQueryMessages[index] = {
    ...state.selectedQueryMessages[index],
    ...message,
  };
};

const removeMessage = (state: QueryState, messageUuid: string) => {
  state.selectedQueryMessages = state.selectedQueryMessages.filter(
    (item) => item.uuid !== messageUuid,
  );
};

const resetSelectedQuery = (state: QueryState) => {
  state.selectedQuery = null;
  state.selectedQueryRequestUuid = null;
  state.selectedQueryLoading = false;
  state.selectedQueryMessages = [];
  state.selectedQueryMessagesHasMore = false;
  state.selectedQueryMessagesLoading = false;
  state.selectedQueryMessagesLoadingMore = false;
};

const applyStatusChange = (
  state: QueryState,
  change: QueryStatusChangeEvent,
) => {
  const patch = {
    status: change.status,
    resolved_at: change.resolved_at ?? null,
  };

  state.queries = state.queries.map((item) =>
    item.uuid === change.query_uuid ? { ...item, ...patch } : item,
  );

  if (isSelectedQuery(state, change.query_uuid) && state.selectedQuery) {
    state.selectedQuery = { ...state.selectedQuery, ...patch };
    if (change.message) upsertMessage(state, change.message);
  }
};

/** Replaces a query's members on the open chat and in the list (API responses and realtime). */
const setMembers = (
  state: QueryState,
  queryUuid: string,
  members: QueryMember[],
) => {
  if (isSelectedQuery(state, queryUuid) && state.selectedQuery) {
    state.selectedQuery.members = members;
  }
  state.queries = state.queries.map((item) =>
    item.uuid === queryUuid ? { ...item, members } : item,
  );
};

/** Identifies a list "view": pages fetched with the same filter/search belong together. */
const listFilterKeyOf = (params?: ListQueriesParams) =>
  JSON.stringify([
    params?.status ?? null,
    params?.search ?? null,
    params?.priority ?? null,
    params?.module ?? null,
    params?.only_my_queries ?? null,
    params?.archive ?? null,
  ]);

/* ----------------------------------- Slice ---------------------------------- */

const initialState: QueryState = {
  queries: [],
  total: 0,
  count: 0,
  page: 1,
  limit: 10,
  loading: false,
  loadingMore: false,
  selectedQuery: null,
  selectedQueryLoading: false,
  selectedQueryRequestUuid: null,
  selectedQueryMessages: [],
  selectedQueryMessagesLoading: false,
  selectedQueryMessagesLoadingMore: false,
  messageSendingLoading: false,
  selectedQueryMessagesHasMore: false,
  selectedQueryMessagesLimit: 50,
  error: null,
  listFilterKey: "",
};

/** Sending, editing and deleting a message share one "busy" flag for the composer. */
const messageMutations = [
  createQueryMessageAction,
  updateQueryMessageAction,
  deleteQueryMessageAction,
] as const;

const querySlice = createSlice({
  name: "query",
  initialState,
  reducers: {
    clearSelectedQuery: resetSelectedQuery,
    queryMessageUpserted: (
      state,
      action: PayloadAction<{ query_uuid: string; message: QueryMessage }>,
    ) => {
      if (!isSelectedQuery(state, action.payload.query_uuid)) return;
      upsertMessage(state, action.payload.message);
    },
    queryMessageRemoved: (
      state,
      action: PayloadAction<{ query_uuid: string; message_uuid: string }>,
    ) => {
      if (!isSelectedQuery(state, action.payload.query_uuid)) return;
      removeMessage(state, action.payload.message_uuid);
    },
    queryStatusChanged: (
      state,
      action: PayloadAction<QueryStatusChangeEvent>,
    ) => {
      applyStatusChange(state, action.payload);
    },
    /** Drops a query from the visible list, e.g. when its new status no longer matches the active filter. */
    queryRemovedFromList: (state, action: PayloadAction<string>) => {
      const before = state.queries.length;
      state.queries = state.queries.filter(
        (item) => item.uuid !== action.payload,
      );
      if (state.queries.length < before) {
        state.total = Math.max(0, state.total - 1);
      }
    },
    queryMembersChanged: (
      state,
      action: PayloadAction<QueryMembersChangedEvent>,
    ) => {
      setMembers(state, action.payload.query_uuid, action.payload.members);
    },
    setQueryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ------------------------------ Query list ------------------------------ */
      .addCase(listQueriesAction.pending, (state, action) => {
        state.error = null;

        if (action.meta.arg.params?.isInfiniteScroll) {
          state.loadingMore = true;
          return;
        }

        // A first-page fetch starts a new list view (filter/search changed).
        state.listFilterKey = listFilterKeyOf(action.meta.arg.params);
        state.loading = true;
      })
      .addCase(listQueriesAction.fulfilled, (state, action) => {
        const params = action.meta.arg.params;
        // Response for a filter the user already left (e.g. page 2 of the old filter
        // arriving after switching): drop it so old rows never mix into the new list.
        if (listFilterKeyOf(params) !== state.listFilterKey) {
          if (params?.isInfiniteScroll) state.loadingMore = false;
          return;
        }

        const rows = rowsOf<QueryDetail>(action.payload);
        state.loading = false;
        state.loadingMore = false;
        state.total = action.payload?.total ?? rows.length;
        state.count = action.payload?.count ?? rows.length;
        state.page = action.payload?.current_page ?? state.page;
        state.limit = action.payload?.per_page ?? state.limit;

        state.queries = params?.isInfiniteScroll
          ? [...state.queries, ...mergeUniqueByUuid(state.queries, rows)]
          : rows;
      })
      .addCase(listQueriesAction.rejected, (state, action) => {
        const params = action.meta.arg.params;
        if (listFilterKeyOf(params) !== state.listFilterKey) {
          if (params?.isInfiniteScroll) state.loadingMore = false;
          return;
        }
        state.loading = false;
        state.loadingMore = false;
        state.error = errorMessageOf(action.payload, "Unable to load queries");
      })

      /* ---------------------------- Selected query ---------------------------- */
      .addCase(getQueryAction.pending, (state, action) => {
        state.selectedQueryRequestUuid = action.meta.arg.query_uuid;
        state.selectedQueryLoading = true;
        state.error = null;
      })
      .addCase(getQueryAction.fulfilled, (state, action) => {
        // Opening A then quickly B: A's late response must not replace B.
        if (action.meta.arg.query_uuid !== state.selectedQueryRequestUuid) {
          return;
        }
        const fetched = (action.payload ?? null) as QueryDetail | null;
        state.selectedQueryLoading = false;
        state.selectedQuery = fetched;
        if (fetched) {
          state.queries = state.queries.map((item) =>
            item.uuid === fetched.uuid ? { ...item, ...fetched } : item,
          );
        }
      })
      .addCase(getQueryAction.rejected, (state, action) => {
        if (action.meta.arg.query_uuid !== state.selectedQueryRequestUuid) {
          return;
        }
        state.selectedQueryLoading = false;
        state.selectedQuery = null;
        state.error = errorMessageOf(
          action.payload,
          "Unable to load query detail",
        );
      })
      .addCase(createQueryAction.rejected, (state, action) => {
        state.error = errorMessageOf(action.payload, "Unable to create query");
      })
      .addCase(deleteQueryAction.fulfilled, (state, action) => {
        const queryUuid = action.meta.arg.query_uuid;
        const before = state.queries.length;
        state.queries = state.queries.filter((item) => item.uuid !== queryUuid);
        if (state.queries.length < before) {
          state.total = Math.max(0, state.total - 1);
        }
        if (isSelectedQuery(state, queryUuid)) resetSelectedQuery(state);
      })
      .addCase(changeQueryStatusAction.fulfilled, (state, action) => {
        const change = action.payload?.data as
          QueryStatusChangeEvent | undefined;
        if (change?.query_uuid) applyStatusChange(state, change);
      })

      /* ------------------------------- Messages ------------------------------- */
      .addCase(getQueryMessagesAction.pending, (state, action) => {
        const isLatestPage = !action.meta.arg.params?.before;
        if (isLatestPage) state.selectedQueryMessages = [];
        state.selectedQueryMessagesLoading = isLatestPage;
        state.selectedQueryMessagesLoadingMore = !isLatestPage;
        state.error = null;
      })
      .addCase(getQueryMessagesAction.fulfilled, (state, action) => {
        state.selectedQueryMessagesLoading = false;
        state.selectedQueryMessagesLoadingMore = false;

        // A late response for a query the user already navigated away from must not overwrite the chat.
        if (!isSelectedQuery(state, action.meta.arg.query_uuid)) return;

        const payload = action.payload as GetQueryMessagesResponse | undefined;
        const rows = rowsOf<QueryMessage>(payload);
        const isLatestPage = !action.meta.arg.params?.before;

        state.selectedQueryMessagesLimit =
          payload?.limit ?? state.selectedQueryMessagesLimit;
        state.selectedQueryMessagesHasMore = Boolean(payload?.has_more);
        // Older pages are prepended. Realtime messages that arrived meanwhile are kept,
        // and anything already present (by uuid) isn't duplicated.
        state.selectedQueryMessages = sortMessagesByCreatedAt(
          isLatestPage
            ? [...rows, ...mergeUniqueByUuid(rows, state.selectedQueryMessages)]
            : [
                ...mergeUniqueByUuid(state.selectedQueryMessages, rows),
                ...state.selectedQueryMessages,
              ],
        );
      })
      .addCase(getQueryMessagesAction.rejected, (state, action) => {
        state.selectedQueryMessagesLoading = false;
        state.selectedQueryMessagesLoadingMore = false;
        state.error = errorMessageOf(
          action.payload,
          "Unable to load query messages",
        );
      })
      .addCase(createQueryMessageAction.fulfilled, (state, action) => {
        const message = action.payload?.data as QueryMessage | undefined;
        if (
          message?.uuid &&
          isSelectedQuery(state, action.meta.arg.query_uuid)
        ) {
          upsertMessage(state, message);
        }
      })
      .addCase(updateQueryMessageAction.fulfilled, (state, action) => {
        const message = action.payload?.data as QueryMessage | undefined;
        if (
          message?.uuid &&
          isSelectedQuery(state, action.meta.arg.query_uuid)
        ) {
          upsertMessage(state, message);
        }
      })
      .addCase(deleteQueryMessageAction.fulfilled, (state, action) => {
        if (isSelectedQuery(state, action.meta.arg.query_uuid)) {
          removeMessage(state, action.meta.arg.message_uuid);
        }
      })

      /* -------------------------------- Members ------------------------------- */
      .addCase(addQueryMemberAction.fulfilled, (state, action) => {
        // The backend returns the full, updated member list in `data`.
        const members = action.payload?.data as QueryMember[] | undefined;
        if (Array.isArray(members)) {
          setMembers(state, action.meta.arg.query_uuid, members);
        }
      })
      .addCase(removeQueryMemberAction.fulfilled, (state, action) => {
        const { query_uuid, member_uuid } = action.meta.arg;
        const members = action.payload?.data as QueryMember[] | undefined;
        if (Array.isArray(members)) {
          setMembers(state, query_uuid, members);
        } else if (isSelectedQuery(state, query_uuid) && state.selectedQuery) {
          setMembers(
            state,
            query_uuid,
            state.selectedQuery.members.filter(
              (member) => member.uuid !== member_uuid,
            ),
          );
        }
      })

      // Matchers must come after all addCase calls.
      .addMatcher(
        isAnyOf(...messageMutations.map((thunk) => thunk.pending)),
        (state) => {
          state.messageSendingLoading = true;
        },
      )
      .addMatcher(
        isAnyOf(
          ...messageMutations.flatMap((thunk) => [
            thunk.fulfilled,
            thunk.rejected,
          ]),
        ),
        (state) => {
          state.messageSendingLoading = false;
        },
      );
  },
});

export const {
  clearSelectedQuery,
  queryMessageUpserted,
  queryMessageRemoved,
  queryStatusChanged,
  queryRemovedFromList,
  queryMembersChanged,
  setQueryError,
} = querySlice.actions;
export const queryReducer = querySlice.reducer;
