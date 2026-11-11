"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/store";
import { listQueriesAction } from "@/features/query/list-queries/list-queries.action";
import { getQueryAction } from "@/features/query/get-query/get-query.action";
import { createQueryAction } from "@/features/query/create-query/create-query.action";
import { createQueryMessageAction } from "@/features/query/create-query-message/create-query-message.action";
import { changeQueryStatusAction } from "@/features/query/change-query-status/change-query-status.action";
import { getQueryMessagesAction } from "@/features/query/get-query-messages/get-query-messages.action";
import { updateQueryMessageAction } from "@/features/query/update-query-message/update-query-message.action";
import { deleteQueryMessageAction } from "@/features/query/delete-query-message/delete-query-message.action";
import { fileUploadAction } from "@/features/file-upload/file-upload.action";
import { appendSelectedQueryMessage } from "@/features/query/query.slice";
import useWebSocket from "@/hooks/use-websocket";
import { QueryList } from "./query-list";
import { QueryDetail } from "./query-detail";
import { QueryEmptyState } from "./query-empty-state";
import { useParams } from "next/navigation";
import { InfiniteMultiSelect } from "@/shared/infinite-multi-select";
import { useInfiniteUserList } from "@/shared/hooks/use-infinite-user-list";
import { UserInterface } from "@/features/user/user.type";
import { QueryStatus } from "../../../../../../packages/common/src/enums/query";

const statusOptions = ["ALL", "OPEN", "IN_PROGRESS", "PENDING_EMP", "RESOLVED"];

export function QueryChatBoard() {
  const dispatch = useAppDispatch();
  const params = useParams<{ organization_uuid: string }>();
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
    selectedQueryMessagesPage,
    selectedQueryMessagesLimit,
  } = useAppSelector((state) => state.querySlice);
  const { currentUser } = useAppSelector((state) => state.userSlice);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>([]);
  const [createForm, setCreateForm] = useState({
    ticket_number: "",
    subject: "",
    description: "",
    module: "Other",
    priority: "Medium",
    assigned_team: "",
    sla_due_at: "",
  });

  const {
    users: assigneeUsers,
    isLoading: assigneeLoading,
    isLoadingMore: assigneeLoadingMore,
    count: assigneeCount,
    onSearch: onAssigneeSearch,
    onLoadMore: onAssigneeLoadMore,
  } = useInfiniteUserList(10, assigneeOpen, "true");

  const fetchQueries = useCallback(
    async (page = 1, isInfiniteScroll = false) => {
      if (!orgUuid) return;

      await dispatch(
        listQueriesAction({
          org_uuid: orgUuid,
          params: {
            page,
            limit: 10,
            status: statusFilter === "ALL" ? undefined : statusFilter,
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
    void fetchQueries(Math.ceil(queries.length / 10) + 1, true);
  }, [fetchQueries, loadingMore, queries.length, total]);

  useEffect(() => {
    if (!isConnected || !orgUuid || !currentUser?.user_id || !selectedQuery?.uuid) {
      return;
    }

    sendMessage(
      JSON.stringify({
        action: "subscribe_query",
        organization: orgUuid,
        user_uuid: currentUser.user_id,
        query_uuid: selectedQuery.uuid,
      }),
    );

    return () => {
      sendMessage(
        JSON.stringify({
          action: "unsubscribe_query",
          organization: orgUuid,
          query_uuid: selectedQuery.uuid,
          user_uuid: currentUser.user_id,
        }),
      );
    };
  }, [currentUser?.user_id, isConnected, orgUuid, selectedQuery?.uuid, sendMessage]);

  useEffect(() => {
    if (!selectedQuery?.uuid) {
      return;
    }

    const unsubscribe = receiveMessage("QUERY_MESSAGE", (payload) => {
      const incomingMessage = payload?.content?.message;
      const incomingQueryUuid = payload?.content?.query_uuid;

      if (!incomingMessage || incomingQueryUuid !== selectedQuery.uuid) {
        return;
      }

      const incomingId = incomingMessage.uuid ?? incomingMessage.id;
      if (!incomingId || selectedQueryMessages.some((message) => (message.uuid ?? message.id) === incomingId)) {
        return;
      }

      dispatch(appendSelectedQueryMessage(incomingMessage));
    });

    return unsubscribe;
  }, [dispatch, receiveMessage, selectedQuery?.uuid, selectedQueryMessages]);

  const handleSelectQuery = useCallback(
    async (queryUuid: string) => {
      if (!orgUuid) return;
      await dispatch(getQueryAction({ org_uuid: orgUuid, query_uuid: queryUuid }));
      await dispatch(
        getQueryMessagesAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          params: { page: 1, limit: selectedQueryMessagesLimit },
        }),
      );
    },
    [dispatch, orgUuid, selectedQueryMessagesLimit],
  );

  const handleCreateQuery = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!orgUuid || !currentUser?.user_id) return;
      if (!createForm.subject.trim() || !createForm.description.trim() || selectedAssigneeIds.length === 0) return;

      const actionResult = await dispatch(
        createQueryAction({
          org_uuid: orgUuid,
          data: {
            ticket_number: createForm.ticket_number || undefined,
            creator_id: currentUser.user_id,
            assignee_ids: selectedAssigneeIds,
            subject: createForm.subject.trim(),
            description: createForm.description.trim(),
            module: createForm.module,
            priority: createForm.priority,
            assigned_team: createForm.assigned_team || undefined,
            sla_due_at: createForm.sla_due_at || undefined,
            resolved_at: null,
            initial_message: createForm.description.trim(),
          },
        }),
      );

      if (createQueryAction.fulfilled.match(actionResult)) {
        const createdQuery = actionResult.payload as {
          uuid?: string;
          data?: { uuid?: string };
        } | undefined;
        const queryUuid = createdQuery?.uuid ?? createdQuery?.data?.uuid;

        if (queryUuid) {
          await dispatch(getQueryAction({ org_uuid: orgUuid, query_uuid: queryUuid }));
        }

        setIsCreateOpen(false);
        setSelectedAssigneeIds([]);
        setCreateForm({
          ticket_number: "",
          subject: "",
          description: "",
          module: "Other",
          priority: "Medium",
          assigned_team: "",
          sla_due_at: "",
        });
      }
    },
    [createForm, currentUser?.user_id, dispatch, orgUuid, selectedAssigneeIds],
  );

  const handleStatusChange = useCallback(
    async (queryUuid: string, status: string) => {
      if (!orgUuid) return;
      const result = await dispatch(
        changeQueryStatusAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          data: { status },
        }),
      );

      if (changeQueryStatusAction.fulfilled.match(result)) {
        await dispatch(getQueryAction({ org_uuid: orgUuid, query_uuid: queryUuid }));
      }
    },
    [dispatch, orgUuid],
  );

  const handleLoadMoreMessages = useCallback(async () => {
    if (!orgUuid || !selectedQuery) return;
    if (selectedQueryMessagesLoading || selectedQueryMessagesLoadingMore || !selectedQueryMessagesHasMore) return;

    await dispatch(
      getQueryMessagesAction({
        org_uuid: orgUuid,
        query_uuid: selectedQuery.uuid,
        params: {
          page: selectedQueryMessagesPage + 1,
          limit: selectedQueryMessagesLimit,
        },
      }),
    );
  }, [dispatch, orgUuid, selectedQuery, selectedQueryMessagesHasMore, selectedQueryMessagesLoading, selectedQueryMessagesLoadingMore, selectedQueryMessagesLimit, selectedQueryMessagesPage]);

  const handleSendMessage = useCallback(
    async (queryUuid: string, content: string, attachment?: File) => {
      if (!orgUuid) return;

      let uploadedAttachment:
        | {
            file_name: string;
            file_url: string;
            meta_data: {
              type: string;
              size: number;
            };
          }
        | undefined;

      if (attachment) {
        const formData = new FormData();
        formData.append("file", attachment);
        const uploadResult = await dispatch(fileUploadAction(formData));

        if (!fileUploadAction.fulfilled.match(uploadResult) || !uploadResult.payload?.url) {
          return;
        }

        uploadedAttachment = {
          file_name: attachment.name,
          file_url: uploadResult.payload.url,
          meta_data: {
            type: attachment.type,
            size: attachment.size,
          },
        };
      }

      const trimmedContent = content.trim();
      const messageContent =
        trimmedContent ||
        (attachment ? `Sent an attachment: ${attachment.name}` : "");

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

      await dispatch(
        getQueryMessagesAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          params: { page: 1, limit: selectedQueryMessagesLimit },
        }),
      );
    },
    [dispatch, orgUuid, selectedQueryMessagesLimit],
  );

  const handleEditMessage = useCallback(
    async (queryUuid: string, messageUuid: string, content: string) => {
      if (!orgUuid || !content.trim()) return;

      await dispatch(
        updateQueryMessageAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          message_uuid: messageUuid,
          data: {
            content: content.trim(),
          },
        }),
      );

      await dispatch(
        getQueryMessagesAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          params: { page: 1, limit: selectedQueryMessagesLimit },
        }),
      );
    },
    [dispatch, orgUuid, selectedQueryMessagesLimit],
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

      await dispatch(
        getQueryMessagesAction({
          org_uuid: orgUuid,
          query_uuid: queryUuid,
          params: { page: 1, limit: selectedQueryMessagesLimit },
        }),
      );
    },
    [dispatch, orgUuid, selectedQueryMessagesLimit],
  );


  return (
    <div className="space-y-4 p-4 h-[calc(100vh-53px)]">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by ticket, subject, or description"
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 md:w-55">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "ALL" ? "All statuses" : status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="button" onClick={() => setIsCreateOpen((current) => !current)}>
          {isCreateOpen ? "Close" : "New query"}
        </Button>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create query</DialogTitle>
            <DialogDescription>
              Creator is set to the current user and the assignee is selected from the organization users.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateQuery} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Ticket number</label>
                <Input
                  value={createForm.ticket_number}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, ticket_number: event.target.value }))
                  }
                  placeholder="Optional ticket no."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Creator</label>
                <Input value={currentUser?.name ?? "Current user"} readOnly />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Assignees</label>
                <InfiniteMultiSelect
                  value={selectedAssigneeIds}
                  onValuesChange={setSelectedAssigneeIds}
                  onOpenChange={(open) => setAssigneeOpen(open)}
                  data={assigneeUsers}
                  total={assigneeCount}
                  isLoading={assigneeLoading}
                  isLoadingMore={assigneeLoadingMore}
                  onSearch={onAssigneeSearch}
                  onLoadMore={onAssigneeLoadMore}
                  getValue={(user: UserInterface) => user.user_id}
                  getLabel={(user: UserInterface) => `${user.name} (${user.email})`}
                  placeholder="Select assignees"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Module</label>
                <Select
                  value={createForm.module}
                  onValueChange={(value) =>
                    setCreateForm((current) => ({ ...current, module: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Module" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Payroll', 'Attendance', 'Leave', 'IT Assets', 'Other'].map((module) => (
                      <SelectItem key={module} value={module}>
                        {module}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Priority</label>
                <Select
                  value={createForm.priority}
                  onValueChange={(value) =>
                    setCreateForm((current) => ({ ...current, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Low', 'Medium', 'High', 'Urgent'].map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">SLA due date</label>
                <Input
                  type="datetime-local"
                  value={createForm.sla_due_at}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, sla_due_at: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Subject</label>
              <Input
                value={createForm.subject}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, subject: event.target.value }))
                }
                placeholder="Query subject"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Assigned team</label>
              <Input
                value={createForm.assigned_team}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, assigned_team: event.target.value }))
                }
                placeholder="Optional assigned team"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <Textarea
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, description: event.target.value }))
                }
                placeholder="Describe the issue or request"
                className="min-h-30"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !createForm.subject.trim() ||
                  !createForm.description.trim() ||
                  selectedAssigneeIds.length === 0 ||
                  !currentUser?.user_id
                }
              >
                Create query
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)] h-[calc(100%-82px)]">
        <QueryList
          queries={queries}
          total={total}
          loading={loading}
          loadingMore={loadingMore}
          selectedQueryId={selectedQuery?.uuid ?? null}
          onSelect={handleSelectQuery}
          fetchMore={handleLoadMore}
        />

        {selectedQuery ? (
          <QueryDetail
            query={selectedQuery}
            loading={selectedQueryLoading}
            messages={selectedQueryMessages}
            messagesLoading={selectedQueryMessagesLoading}
            messagesLoadingMore={selectedQueryMessagesLoadingMore}
            hasMoreMessages={selectedQueryMessagesHasMore}
            onStatusChange={handleStatusChange}
            onSendMessage={handleSendMessage}
            onEditMessage={handleEditMessage}
            onDeleteMessage={handleDeleteMessage}
            onLoadMoreMessages={handleLoadMoreMessages}
          />
        ) : (
          <QueryEmptyState />
        )}
      </div>
    </div>
  );
}

export default QueryChatBoard;
