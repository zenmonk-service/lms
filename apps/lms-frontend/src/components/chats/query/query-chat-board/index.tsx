"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { listQueriesAction } from "@/features/query/list-queries/list-queries.action";
import { getQueryAction } from "@/features/query/get-query/get-query.action";
import { createQueryMessageAction } from "@/features/query/create-query-message/create-query-message.action";
import { changeQueryStatusAction } from "@/features/query/change-query-status/change-query-status.action";
import { getQueryMessagesAction } from "@/features/query/get-query-messages/get-query-messages.action";
import { updateQueryMessageAction } from "@/features/query/update-query-message/update-query-message.action";
import { deleteQueryMessageAction } from "@/features/query/delete-query-message/delete-query-message.action";
import { fileUploadAction } from "@/features/file-upload/file-upload.action";
import {
  clearSelectedQuery,
  queryMessageRemoved,
  queryMessageUpserted,
  queryStatusChanged,
  queryRemovedFromList,
  queryMembersChanged,
} from "@/features/query/query.slice";
import {
  QueryMessage,
  QueryRealtimeEvent,
  QueryMembersChangedEvent,
  QueryStatusChangeEvent,
} from "@/features/query/query.types";
import { addQueryMemberAction } from "@/features/query/add-query-member/add-query-member.action";
import { removeQueryMemberAction } from "@/features/query/remove-query-member/remove-query-member.action";
import { CreateQueryMessagePayload } from "@/features/query/create-query-message/create-query-message.types";
import useWebSocket from "@/hooks/use-websocket";
import { QueryList } from "../query-list";
import { QueryDetail } from "../query-detail";
import {
  QueryEmptyState,
  QueryUnavailable,
  QueryUnavailableReason,
} from "../query-empty-state";
import { CreateQueryDialog } from "../create-query-dialog";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { attachmentOnlyContent } from "@/utils/query";
import { SocketAction, SocketActionType } from "@repo/common";

const QUERY_PAGE_SIZE = 10;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALL_STATUSES = "ALL";
const STATUS_FILTERS = [
  ALL_STATUSES,
  "OPEN",
  "IN_PROGRESS",
  "PENDING_EMP",
  "RESOLVED",
];

type AppDispatch = ReturnType<typeof useAppDispatch>;
type UploadedAttachment = NonNullable<
  CreateQueryMessagePayload["data"]["attachment"]
>;

/** Uploads a chat attachment; resolves to null when the upload fails (the thunk already toasts). */
async function uploadAttachment(
  dispatch: AppDispatch,
  file: File,
): Promise<UploadedAttachment | null> {
  const formData = new FormData();
  formData.append("file", file);
  const result = await dispatch(fileUploadAction(formData));

  if (!fileUploadAction.fulfilled.match(result) || !result.payload?.url) {
    return null;
  }

  return {
    file_name: file.name,
    file_url: result.payload.url,
    meta_data: { type: file.type, size: file.size },
  };
}

export function QueryChatBoard() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  // `query_uuid` comes from `/chats/<query_uuid>`; the URL is the source of truth for the open query.
  const params = useParams<{
    organization_uuid: string;
    query_uuid?: string;
  }>();
  const routeQueryUuid = params.query_uuid ?? null;
  const { sendMessage, isConnected, receiveMessage } = useWebSocket(
    process.env.NEXT_PUBLIC_WEBSOCKET_URL!,
  );
  const orgUuid = params.organization_uuid;
  const {
    queries,
    total,
    loading,
    loadingMore,
    selectedQuery,
    selectedQueryLoading,
    selectedQueryMessages,
    selectedQueryMessagesLoading,
    selectedQueryMessagesLoadingMore,
    selectedQueryMessagesHasMore,
    selectedQueryMessagesLimit,
  } = useAppSelector((state) => state.querySlice);
  const { currentUser } = useAppSelector((state) => state.userSlice);

  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Why the query in the URL can't be shown (missing, malformed link, or not a member).
  const [unavailable, setUnavailable] = useState<{
    queryUuid: string;
    reason: QueryUnavailableReason;
  } | null>(null);

  const fetchQueries = useCallback(
    async (page = 1, isInfiniteScroll = false) => {
      if (!orgUuid) return;

      await dispatch(
        listQueriesAction({
          org_uuid: orgUuid,
          params: {
            page,
            limit: QUERY_PAGE_SIZE,
            status: statusFilter === ALL_STATUSES ? undefined : statusFilter,
            search: search || undefined,
            isInfiniteScroll,
          },
        }),
      );
    },
    [dispatch, orgUuid, search, statusFilter],
  );

  useEffect(() => {
    void fetchQueries(1, false);
  }, [fetchQueries]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || queries.length >= total) return;
    void fetchQueries(Math.ceil(queries.length / QUERY_PAGE_SIZE) + 1, true);
  }, [fetchQueries, loadingMore, queries.length, total]);

  const userUuid = currentUser?.user_id;

  /** Sends a subscribe/unsubscribe command to the websocket service. */
  const sendSocketAction = useCallback(
    (action: SocketActionType, extra: Record<string, string> = {}) => {
      if (!orgUuid || !userUuid) return;
      sendMessage(
        JSON.stringify({
          action,
          organization: orgUuid,
          user_uuid: userUuid,
          ...extra,
        }),
      );
    },
    [orgUuid, sendMessage, userUuid],
  );

  // Query channel: messages and status changes of the open query.
  const selectedQueryUuid = selectedQuery?.uuid;
  useEffect(() => {
    if (!isConnected || !selectedQueryUuid) return;

    const channel = { query_uuid: selectedQueryUuid };
    sendSocketAction(SocketAction.ENUM.SUBSCRIBE_QUERY, channel);
    return () => sendSocketAction(SocketAction.ENUM.UNSUBSCRIBE_QUERY, channel);
  }, [isConnected, selectedQueryUuid, sendSocketAction]);

  // Organization channel: status changes for any query, so the list stays live
  // even for queries nobody here has open.
  useEffect(() => {
    if (!isConnected) return;

    sendSocketAction(SocketAction.ENUM.SUBSCRIBE);
    return () => sendSocketAction(SocketAction.ENUM.UNSUBSCRIBE);
  }, [isConnected, sendSocketAction]);

  // Read by the realtime listener without re-subscribing on every change.
  const accessRef = useRef({
    userUuid: currentUser?.user_id,
    openQueryUuid: selectedQuery?.uuid,
    creatorUuid: selectedQuery?.creator?.user_id,
  });
  accessRef.current = {
    userUuid: currentUser?.user_id,
    openQueryUuid: selectedQuery?.uuid,
    creatorUuid: selectedQuery?.creator?.user_id,
  };

  // Realtime events for the open query. Reducers are idempotent and ignore events for
  // other queries, so our own echoes and late events are safe to apply.
  useEffect(() => {
    if (!isConnected) return;

    type MessageEvent = {
      content?: { query_uuid: string; message?: QueryMessage };
    };
    const onMessageUpserted = ({ content }: MessageEvent) => {
      if (!content?.message?.uuid) return;
      dispatch(
        queryMessageUpserted({
          query_uuid: content.query_uuid,
          message: content.message,
        }),
      );
    };

    const listeners = [
      receiveMessage(QueryRealtimeEvent.MESSAGE_CREATED, onMessageUpserted),
      receiveMessage(QueryRealtimeEvent.MESSAGE_UPDATED, onMessageUpserted),
      receiveMessage(
        QueryRealtimeEvent.MESSAGE_DELETED,
        ({
          content,
        }: {
          content?: { query_uuid: string; message_uuid?: string };
        }) => {
          if (!content?.message_uuid) return;
          dispatch(
            queryMessageRemoved({
              query_uuid: content.query_uuid,
              message_uuid: content.message_uuid,
            }),
          );
        },
      ),
      receiveMessage(
        QueryRealtimeEvent.STATUS_CHANGED,
        ({ content }: { content?: QueryStatusChangeEvent }) => {
          if (!content?.query_uuid || !content.status) return;

          dispatch(queryStatusChanged(content));

          // Keep the filtered list honest: a query that moved out of the selected status leaves it.
          if (
            statusFilter !== ALL_STATUSES &&
            content.status !== statusFilter
          ) {
            dispatch(queryRemovedFromList(content.query_uuid));
          }
        },
      ),
      receiveMessage(
        QueryRealtimeEvent.MEMBERS_CHANGED,
        ({ content }: { content?: QueryMembersChangedEvent }) => {
          if (!content?.query_uuid || !Array.isArray(content.members)) return;

          // Removed from the query I'm looking at: I lose access right away.
          const { userUuid, openQueryUuid, creatorUuid } = accessRef.current;
          const stillHasAccess =
            creatorUuid === userUuid ||
            content.members.some((member) => member.user?.user_id === userUuid);
          if (content.query_uuid === openQueryUuid && !stillHasAccess) {
            dispatch(clearSelectedQuery());
            dispatch(queryRemovedFromList(content.query_uuid));
            setUnavailable({
              queryUuid: content.query_uuid,
              reason: "removed",
            });
            return;
          }

          dispatch(queryMembersChanged(content));
        },
      ),
    ];

    return () => listeners.forEach((unsubscribe) => unsubscribe());
  }, [dispatch, isConnected, receiveMessage, statusFilter]);

  const listUrl = `/${orgUuid}/chats`;
  // True when the open chat was reached from the list in this tab, so "back" can pop history.
  const openedFromListRef = useRef(false);

  /** Opening a query = navigating to its URL; loading follows from the URL below. */
  const handleSelectQuery = useCallback(
    (queryUuid: string) => {
      if (queryUuid === routeQueryUuid) return;
      openedFromListRef.current = true;
      router.push(`${listUrl}/${queryUuid}`);
    },
    [listUrl, routeQueryUuid, router],
  );

  // Load whatever query the URL points at (list click, shared link, browser back/forward).
  useEffect(() => {
    if (!orgUuid) return;

    if (!routeQueryUuid) {
      if (selectedQueryUuid) dispatch(clearSelectedQuery());
      return;
    }
    if (routeQueryUuid === selectedQueryUuid) return;

    setUnavailable(null);
    if (!UUID_PATTERN.test(routeQueryUuid)) {
      // A malformed link: don't send it to the API.
      dispatch(clearSelectedQuery());
      setUnavailable({ queryUuid: routeQueryUuid, reason: "not-found" });
      return;
    }

    void (async () => {
      // Sequential on purpose: the messages reducer only accepts pages for the selected query.
      const result = await dispatch(
        getQueryAction({ org_uuid: orgUuid, query_uuid: routeQueryUuid }),
      );
      if (!getQueryAction.fulfilled.match(result)) {
        // 403 = exists but I'm not the creator or a member.
        const status = (result.payload as { status?: number } | undefined)
          ?.status;
        setUnavailable({
          queryUuid: routeQueryUuid,
          reason: status === 403 ? "forbidden" : "not-found",
        });
        return;
      }
      await dispatch(
        getQueryMessagesAction({
          org_uuid: orgUuid,
          query_uuid: routeQueryUuid,
          params: { limit: selectedQueryMessagesLimit },
        }),
      );
    })();
    // selectedQueryUuid is deliberately left out: it changes as a result of this effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, orgUuid, routeQueryUuid, selectedQueryMessagesLimit]);

  const handleStatusChange = useCallback(
    async (queryUuid: string, status: string) => {
      if (!orgUuid) return;
      await dispatch(
        changeQueryStatusAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          data: { status },
        }),
      );
    },
    [dispatch, orgUuid],
  );

  // Loads the page of messages older than the oldest one on screen.
  const oldestMessageUuid = selectedQueryMessages[0]?.uuid;
  const handleLoadMoreMessages = useCallback(async () => {
    if (!orgUuid || !selectedQuery || !oldestMessageUuid) return;
    if (
      selectedQueryMessagesLoading ||
      selectedQueryMessagesLoadingMore ||
      !selectedQueryMessagesHasMore
    ) {
      return;
    }

    await dispatch(
      getQueryMessagesAction({
        org_uuid: orgUuid,
        query_uuid: selectedQuery.uuid,
        params: {
          before: oldestMessageUuid,
          limit: selectedQueryMessagesLimit,
        },
      }),
    );
  }, [
    dispatch,
    oldestMessageUuid,
    orgUuid,
    selectedQuery,
    selectedQueryMessagesHasMore,
    selectedQueryMessagesLoading,
    selectedQueryMessagesLoadingMore,
    selectedQueryMessagesLimit,
  ]);

  const handleSendMessage = useCallback(
    async (queryUuid: string, content: string, attachment?: File) => {
      if (!orgUuid) return;

      const uploadedAttachment = attachment
        ? await uploadAttachment(dispatch, attachment)
        : undefined;
      if (uploadedAttachment === null) return; // upload failed

      const trimmedContent = content.trim();
      const messageContent =
        trimmedContent ||
        (attachment ? attachmentOnlyContent(attachment.name) : "");

      if (!messageContent) return;

      await dispatch(
        createQueryMessageAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          data: {
            content: messageContent,
            message_type: "PUBLIC",
            attachment: uploadedAttachment,
          },
        }),
      );
    },
    [dispatch, orgUuid],
  );

  // Only the text of a message is editable; attachments never change.
  const handleEditMessage = useCallback(
    async (queryUuid: string, messageUuid: string, content: string) => {
      const trimmedContent = content.trim();
      if (!orgUuid || !trimmedContent) return;

      await dispatch(
        updateQueryMessageAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          message_uuid: messageUuid,
          data: { content: trimmedContent },
        }),
      );
    },
    [dispatch, orgUuid],
  );

  const handleAddMembers = useCallback(
    async (queryUuid: string, userUuids: string[]) => {
      if (!orgUuid || !userUuids.length) return false;
      const result = await dispatch(
        addQueryMemberAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          data: { user_uuids: userUuids },
        }),
      );
      return addQueryMemberAction.fulfilled.match(result);
    },
    [dispatch, orgUuid],
  );

  const handleRemoveMember = useCallback(
    async (queryUuid: string, memberUuid: string) => {
      if (!orgUuid) return;
      await dispatch(
        removeQueryMemberAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          member_uuid: memberUuid,
        }),
      );
    },
    [dispatch, orgUuid],
  );

  const handleDeleteMessage = useCallback(
    async (queryUuid: string, messageUuid: string) => {
      if (!orgUuid) return;

      await dispatch(
        deleteQueryMessageAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          message_uuid: messageUuid,
        }),
      );
    },
    [dispatch, orgUuid],
  );

  // Back to the list: pop history when we came from the list (so the phone's back button
  // and this button agree); for a shared link opened directly, go to the list instead.
  const handleBackToList = useCallback(() => {
    if (openedFromListRef.current) {
      openedFromListRef.current = false;
      router.back();
    } else {
      router.replace(listUrl);
    }
  }, [listUrl, router]);

  const unavailableReason =
    routeQueryUuid && unavailable?.queryUuid === routeQueryUuid
      ? unavailable.reason
      : null;
  // Below xl the list and the chat are separate screens (WhatsApp style); from xl up both are shown side by side.
  const isChatOpen = Boolean(routeQueryUuid);

  return (
    <div className="flex h-[calc(100dvh-53px)] flex-col p-0 sm:p-4">
      <CreateQueryDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        orgUuid={orgUuid}
        onCreated={() => void fetchQueries(1, false)}
      />

      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[380px_minmax(0,1fr)] 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <div
          className={cn(
            "h-full min-h-0 min-w-0",
            isChatOpen && "hidden xl:block",
          )}
        >
          <QueryList
            queries={queries}
            total={total}
            loading={loading}
            loadingMore={loadingMore}
            selectedQueryId={selectedQuery?.uuid ?? null}
            onSelect={handleSelectQuery}
            fetchMore={handleLoadMore}
            statusOptions={STATUS_FILTERS}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            search={search}
            onSearchChange={setSearch}
            onCreateClick={() => setIsCreateOpen(true)}
          />
        </div>

        <div
          className={cn(
            "h-full min-h-0 min-w-0",
            !isChatOpen && "hidden xl:block",
          )}
        >
          {unavailableReason ? (
            <QueryUnavailable
              reason={unavailableReason}
              onBack={handleBackToList}
            />
          ) : isChatOpen ? (
            <QueryDetail
              query={selectedQuery}
              // Also "loading" for the moment between the URL changing and the request starting.
              loading={
                selectedQueryLoading || selectedQuery?.uuid !== routeQueryUuid
              }
              messages={selectedQueryMessages}
              messagesLoading={selectedQueryMessagesLoading}
              messagesLoadingMore={selectedQueryMessagesLoadingMore}
              hasMoreMessages={selectedQueryMessagesHasMore}
              onStatusChange={handleStatusChange}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onAddMembers={handleAddMembers}
              onRemoveMember={handleRemoveMember}
              onLoadMoreMessages={handleLoadMoreMessages}
              onBack={handleBackToList}
            />
          ) : (
            <QueryEmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

export default QueryChatBoard;
