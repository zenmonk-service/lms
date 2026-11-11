import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { listQueriesAction } from "./list-queries/list-queries.action";
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
import { QueryDetail, QueryMessage, QueryMember, QueryState } from "./query.types";

const sortMessagesByCreatedAt = (items: QueryMessage[]) =>
  [...items].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

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
  selectedQueryMessages: [],
  selectedQueryMessagesLoading: false,
  selectedQueryMessagesLoadingMore: false,
  messageSendingLoading: false,
  selectedQueryMessagesHasMore: false,
  selectedQueryMessagesPage: 1,
  selectedQueryMessagesLimit: 50,
  error: null,
};

const querySlice = createSlice({
  name: "query",
  initialState,
  reducers: {
    clearSelectedQuery: (state) => {
      state.selectedQuery = null;
      state.selectedQueryMessages = [];
      state.selectedQueryMessagesPage = 1;
      state.selectedQueryMessagesHasMore = false;
      state.selectedQueryMessagesLoading = false;
      state.selectedQueryMessagesLoadingMore = false;
    },
    appendSelectedQueryMessage: (state, action: PayloadAction<QueryMessage>) => {
      const message = action.payload;
      const exists = state.selectedQueryMessages.some((item) => item.uuid === message.uuid);
      if (!exists) {
        state.selectedQueryMessages = sortMessagesByCreatedAt([
          ...state.selectedQueryMessages,
          message,
        ]);
      }
    },
    setQueryError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(listQueriesAction.pending, (state, action) => {
        const isInfiniteScroll = action.meta.arg.params?.isInfiniteScroll ?? false;
        state.error = null;

        if (isInfiniteScroll) {
          state.loadingMore = true;
          return;
        }

        state.loading = true;
      })
      .addCase(listQueriesAction.fulfilled, (state, action) => {
        const isInfiniteScroll = action.meta.arg.params?.isInfiniteScroll ?? false;
        const rows = Array.isArray(action.payload?.rows) ? action.payload.rows : [];

        state.loading = false;
        state.loadingMore = false;
        state.total = action.payload?.total ?? rows.length;
        state.count = action.payload?.count ?? rows.length;
        state.page = action.payload?.page ?? state.page;
        state.limit = action.payload?.limit ?? state.limit;

        if (isInfiniteScroll && state.queries.length > 0) {
          const existingKeys = new Set(state.queries.map((item) => item.uuid));
          const uniqueRows = rows.filter((item: QueryDetail) => !existingKeys.has(item.uuid));
          state.queries = [...state.queries, ...uniqueRows];
          return;
        }

        state.queries = rows;
      })
      .addCase(listQueriesAction.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = typeof action.payload === "string" ? action.payload : "Unable to load queries";
      })
      .addCase(getQueryAction.pending, (state) => {
        state.selectedQueryLoading = true;
        state.error = null;
      })
      .addCase(getQueryAction.fulfilled, (state, action) => {
        state.selectedQueryLoading = false;
        state.selectedQuery = action.payload ?? null;
        if (state.selectedQuery) {
          state.queries = state.queries.map((item) =>
            item.uuid === state.selectedQuery?.uuid ? state.selectedQuery : item,
          );
        }
      })
      .addCase(getQueryAction.rejected, (state, action) => {
        state.selectedQueryLoading = false;
        state.error = typeof action.payload === "string" ? action.payload : "Unable to load query detail";
      })
      .addCase(getQueryMessagesAction.pending, (state, action) => {
        const page = action.meta.arg.params?.page ?? 1;
        state.selectedQueryMessagesLoading = page <= 1;
        state.selectedQueryMessagesLoadingMore = page > 1;
        state.error = null;
      })
      .addCase(getQueryMessagesAction.fulfilled, (state, action) => {
        const page = action.meta.arg.params?.page ?? 1;
        const limit = action.meta.arg.params?.limit ?? state.selectedQueryMessagesLimit;
        const rows = Array.isArray(action.payload?.rows) ? action.payload.rows : [];

        state.selectedQueryMessagesLoading = false;
        state.selectedQueryMessagesLoadingMore = false;
        state.selectedQueryMessagesPage = page;
        state.selectedQueryMessagesLimit = limit;

        if (page <= 1) {
          state.selectedQueryMessages = sortMessagesByCreatedAt(rows);
        } else {
          const existingKeys = new Set(state.selectedQueryMessages.map((item) => item.uuid));
          const uniqueRows = rows.filter((item: QueryMessage) => !existingKeys.has(item.uuid));
          state.selectedQueryMessages = sortMessagesByCreatedAt([
            ...uniqueRows,
            ...state.selectedQueryMessages,
          ]);
        }

        state.selectedQueryMessagesHasMore =
          rows.length === limit &&
          (action.payload?.total ?? 0) > page * limit;
      })
      .addCase(getQueryMessagesAction.rejected, (state, action) => {
        state.selectedQueryMessagesLoading = false;
        state.selectedQueryMessagesLoadingMore = false;
        state.error = typeof action.payload === "string" ? action.payload : "Unable to load query messages";
      })
      .addCase(createQueryAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createQueryAction.fulfilled, (state, action) => {
        state.loading = false;
        const createdQuery = action.payload as QueryDetail | null | undefined;
        if (createdQuery) {
          state.queries = [createdQuery, ...state.queries.filter((item) => item.uuid !== createdQuery.uuid)];
          state.total = state.total + 1;
          state.selectedQuery = createdQuery;
        }
      })
      .addCase(createQueryAction.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === "string" ? action.payload : "Unable to create query";
      })
      .addCase(deleteQueryAction.fulfilled, (state, action) => {
        const queryUuid = action.meta.arg.query_uuid;
        state.queries = state.queries.filter((item) => item.uuid !== queryUuid);
        if (state.selectedQuery?.uuid === queryUuid) {
          state.selectedQuery = null;
        }
      })
      .addCase(changeQueryStatusAction.fulfilled, (state, action) => {
        const updatedQuery = action.payload as QueryDetail | null | undefined;
        if (!updatedQuery) return;

        state.queries = state.queries.map((item) =>
          item.uuid === updatedQuery.uuid ? updatedQuery : item,
        );

        if (state.selectedQuery?.uuid === updatedQuery.uuid) {
          state.selectedQuery = updatedQuery;
        }
      })
      .addCase(createQueryMessageAction.pending, (state) => {
          state.messageSendingLoading = true;
      })
      .addCase(createQueryMessageAction.fulfilled, (state) => {
        state.messageSendingLoading = false;
        // Query messages are fetched separately so the UI never trusts the mutation response as the source of truth.
      })
      .addCase(createQueryMessageAction.rejected, (state) => {
        state.messageSendingLoading = false;
      })
      .addCase(updateQueryMessageAction.pending, (state) => {
        state.messageSendingLoading = true;
      })
      .addCase(updateQueryMessageAction.fulfilled, (state) => {
        state.messageSendingLoading = false;
      })
      .addCase(updateQueryMessageAction.rejected, (state) => {
        state.messageSendingLoading = false;
      })
      .addCase(deleteQueryMessageAction.pending, (state) => {
        state.messageSendingLoading = true;
      })
      .addCase(deleteQueryMessageAction.fulfilled, (state) => {
        state.messageSendingLoading = false;
      })
      .addCase(deleteQueryMessageAction.rejected, (state) => {
        state.messageSendingLoading = false;
      })
      .addCase(addQueryMemberAction.fulfilled, (state, action) => {
        const member = action.payload as QueryMember | null | undefined;
        if (!member || !state.selectedQuery) return;

        state.selectedQuery = {
          ...state.selectedQuery,
          members: [...(state.selectedQuery.members ?? []), member],
        };
      })
      .addCase(removeQueryMemberAction.fulfilled, (state, action) => {
        const memberUuid = action.meta.arg.member_uuid;
        if (!state.selectedQuery) return;

        state.selectedQuery = {
          ...state.selectedQuery,
          members: (state.selectedQuery.members ?? []).filter(
            (member) => member.uuid !== memberUuid,
          ),
        };
      });
  },
});

export const { clearSelectedQuery, appendSelectedQueryMessage, setQueryError } = querySlice.actions;
export const queryReducer = querySlice.reducer;
