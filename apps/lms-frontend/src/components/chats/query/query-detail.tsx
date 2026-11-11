
"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Clock3,
  Download,
  FileText,
  MessageSquareText,
  Pencil,
  Plus,
  Trash2,
  User,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  QueryAttachment,
  QueryDetail as QueryDetailType,
} from "@/features/query/query.types";
import {
  formatPriority,
  formatQueryDate,
  formatStatus,
} from "@/utils/query";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useAppSelector } from "@/store";
import { QueryStatus } from "@repo/common";

interface QueryDetailProps {
  query: QueryDetailType | null;
  loading: boolean;
  messages: QueryDetailType["messages"];
  messagesLoading?: boolean;
  messagesLoadingMore?: boolean;
  hasMoreMessages?: boolean;

  onStatusChange?: (
    queryUuid: string,
    status: string,
  ) => Promise<void>;

  onSendMessage?: (
    queryUuid: string,
    content: string,
    attachment?: File,
  ) => Promise<void>;

  onEditMessage?: (
    queryUuid: string,
    messageUuid: string,
    content: string,
    attachment?: File,
    removeAttachment?: boolean,
  ) => Promise<void>;

  onDeleteMessage?: (
    queryUuid: string,
    messageUuid: string,
  ) => Promise<void>;

  onLoadMoreMessages?: () => Promise<void>;
}

export function QueryDetail({
  query,
  loading,
  messages,
  messagesLoading,
  messagesLoadingMore,
  hasMoreMessages,
  onStatusChange,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onLoadMoreMessages,
}: QueryDetailProps) {
  const [draft, setDraft] = useState("");
  const [pendingAttachment, setPendingAttachment] =
    useState<File | null>(null);

  const [editingMessageUuid, setEditingMessageUuid] =
    useState<string | null>(null);

  // Existing image attached to the message being edited.
  const [editingAttachment, setEditingAttachment] =
    useState<QueryAttachment | null>(null);

  // True when the user removes the existing image.
  const [removeExistingAttachment, setRemoveExistingAttachment] =
    useState(false);

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUserId = useAppSelector(
    (state) => state.userSlice.currentUser.user_id,
  );

  const { messageSendingLoading } = useAppSelector(
    (state) => state.querySlice,
  );

  // Preview URL for a newly selected image.
  const selectedAttachmentPreviewUrl = useMemo(() => {
    if (
      !pendingAttachment ||
      !pendingAttachment.type.startsWith("image/")
    ) {
      return "";
    }

    return URL.createObjectURL(pendingAttachment);
  }, [pendingAttachment]);

  React.useEffect(() => {
    return () => {
      if (selectedAttachmentPreviewUrl) {
        URL.revokeObjectURL(selectedAttachmentPreviewUrl);
      }
    };
  }, [selectedAttachmentPreviewUrl]);

  const getAttachmentType = (
    attachment?: QueryAttachment | null,
  ) => {
    const type = attachment?.meta_data?.type;
    return typeof type === "string" ? type : "";
  };

  const getAttachmentSize = (
    attachment?: QueryAttachment | null,
  ) => {
    const size = attachment?.meta_data?.size;
    return typeof size === "number" ? size : null;
  };

  const formatFileSize = (size: number | null) => {
    if (!size) return "Unknown size";

    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(size / 1024).toFixed(2)} KB`;
  };

  // Load older messages when scrolling to the top.
  const handleMessagesScroll = async () => {
    const container = messagesContainerRef.current;

    if (
      !container ||
      !hasMoreMessages ||
      messagesLoading ||
      messagesLoadingMore ||
      !onLoadMoreMessages
    ) {
      return;
    }

    if (container.scrollTop <= 80) {
      const previousScrollHeight = container.scrollHeight;

      await onLoadMoreMessages();

      requestAnimationFrame(() => {
        container.scrollTop =
          container.scrollHeight - previousScrollHeight;
      });
    }
  };

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;

    if (!container) return;

    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  };

  React.useEffect(() => {
    if (messages.length) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Select a new attachment.
  const handleAttachmentSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (file) {
      setPendingAttachment(file);
    }

    // Allows selecting the same file again.
    event.target.value = "";
  };

  // Enter edit mode and load the existing message into the composer.
  const handleEditMessage = (
    message: QueryDetailType["messages"][number],
  ) => {
    setEditingMessageUuid(message.uuid);
    setDraft(message.content ?? "");

    const attachment = message.attachment ?? null;

    setEditingAttachment(
      getAttachmentType(attachment).startsWith("image/")
        ? attachment
        : null,
    );

    setPendingAttachment(null);
    setRemoveExistingAttachment(false);
  };

  // Cancel editing.
  const handleCancelEdit = () => {
    setEditingMessageUuid(null);
    setEditingAttachment(null);
    setRemoveExistingAttachment(false);
    setPendingAttachment(null);
    setDraft("");
  };

  // Send a new message or update an existing message.
  const handleSubmitMessage = async () => {
    if (!query || messageSendingLoading) return;

    const content = draft.trim();

    if (editingMessageUuid) {
      if (!onEditMessage) return;

      // Allow empty content only when an attachment change is being made.
      if (
        !content &&
        !pendingAttachment &&
        !removeExistingAttachment
      ) {
        return;
      }

      await onEditMessage(
        query.uuid,
        editingMessageUuid,
        content,
        pendingAttachment ?? undefined,
        removeExistingAttachment,
      );

      handleCancelEdit();
      return;
    }

    if (!content && !pendingAttachment) return;
    if (!onSendMessage) return;

    await onSendMessage(
      query.uuid,
      content,
      pendingAttachment ?? undefined,
    );

    setDraft("");
    setPendingAttachment(null);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-80 items-center justify-center rounded-2xl border border-border bg-card text-sm text-muted-foreground">
        Loading query detail...
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex h-full min-h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
        Select a query to view the thread.
      </div>
    );
  }

  const canSubmit = editingMessageUuid
    ? Boolean(
        draft.trim() ||
          pendingAttachment ||
          removeExistingAttachment,
      ) && Boolean(onEditMessage)
    : Boolean(draft.trim() || pendingAttachment) &&
      Boolean(onSendMessage);
console.log('✌️QueryStatus.getValues() --->', QueryStatus.getValues());
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
      {/* Query details */}
      <Card className="shrink-0">
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                {query.ticket_number}
              </p>

              <CardTitle className="mt-2 text-2xl font-semibold text-foreground">
                {query.subject}
              </CardTitle>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">
                {query.module}
              </Badge>

              <Badge variant="outline" className="capitalize">
                {formatPriority(query.priority)}
              </Badge>

              <Select
                value={query.status}
                onValueChange={(value) =>
                  onStatusChange?.(query.uuid, value)
                }
              >
                <SelectTrigger className="h-9 w-45">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>

                <SelectContent>
                  {QueryStatus.getValues().map((status )  => (
                    <SelectItem key={status} value={status as string}>
                      {formatStatus(status as string)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 text-sm text-foreground">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>
                {query.creator?.name ?? "Unknown creator"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              <span>{formatQueryDate(query.created_at)}</span>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
              <span>{query.assigned_team ?? "Unassigned"}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <p className="whitespace-pre-wrap leading-6 text-foreground">
              {query.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardHeader className="shrink-0 border-b border-border bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareText className="h-4 w-4" />
            Conversation
          </CardTitle>
        </CardHeader>

        <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden bg-muted/5 p-0">
          {/* Messages list */}
          <div
            ref={messagesContainerRef}
            onScroll={handleMessagesScroll}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden border-b border-border bg-muted/20 px-4 py-3"
          >
            {messagesLoading && !messages.length ? (
              <p className="text-sm text-muted-foreground">
                Loading messages...
              </p>
            ) : messages.length ? (
              messages.map((message) => {
                const isCurrentUser =
                  message.sender?.user_id === currentUserId;
                  console.log('✌️QueryStatus.getValues() --->', QueryStatus.getValues());

                  console.log('✌️QueryStatus.getValues() --->', QueryStatus.getValues());


                const senderName =
                  message.sender?.name ?? "System";

                const attachment = message.attachment ?? null;

                const isImageAttachment =
                  getAttachmentType(attachment).startsWith("image/");

                return (
                  <div
                    key={message.uuid}
                    className={`mb-3 flex items-end ${
                      isCurrentUser ? "justify-end" : ""
                    }`}
                  >
                    <Avatar
                      className={`mr-2 h-10 w-10 shrink-0 ${
                        isCurrentUser ? "order-2 ml-2 mr-0" : ""
                      }`}
                    >
                      <AvatarImage
                        src={message.sender?.image ?? undefined}
                        className="h-full w-full object-cover"
                      />

                      <AvatarFallback className="text-xs">
                        {senderName
                          .split(" ")
                          .slice(0, 2)
                          .join(" ")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="max-w-[80%] min-w-0 rounded-2xl border border-border bg-background p-3 shadow-sm">
                      {/* Message header */}
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                        <span className="font-medium">
                          {senderName}
                        </span>

                        <div className="flex items-center gap-2">
                          <span>
                            {formatQueryDate(message.created_at)}
                          </span>

                          {message.updated_at &&
                          message.updated_at !== message.created_at ? (
                            <span className="text-[10px]">
                              (edited)
                            </span>
                          ) : null}

                          {isCurrentUser && (
                            <>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6"
                                title="Edit message"
                                onClick={() =>
                                  handleEditMessage(message)
                                }
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>

                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-destructive"
                                title="Delete message"
                                onClick={async () => {
                                  const shouldDelete =
                                    window.confirm(
                                      "Delete this message?",
                                    );

                                  if (!shouldDelete) return;

                                  await onDeleteMessage?.(
                                    query.uuid,
                                    message.uuid,
                                  );

                                  if (
                                    editingMessageUuid === message.uuid
                                  ) {
                                    handleCancelEdit();
                                  }
                                }}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Message content */}
                      {message.content ? (
                        <p className="whitespace-pre-wrap break-words text-sm text-foreground">
                          {message.content}
                        </p>
                      ) : null}

                      {/* Existing message attachment */}
                      {attachment ? (
                        <div className="mt-2">
                          {isImageAttachment ? (
                            <a
                              href={attachment.file_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src={attachment.file_url}
                                alt={attachment.file_name}
                                className="max-h-52 max-w-full rounded-xl border border-border object-contain"
                              />
                            </a>
                          ) : (
                            <a
                              href={attachment.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm hover:bg-muted/40"
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <FileText className="h-4 w-4 shrink-0" />

                                <div className="min-w-0">
                                  <p className="truncate font-medium text-foreground">
                                    {attachment.file_name}
                                  </p>

                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(
                                      getAttachmentSize(attachment),
                                    )}
                                  </p>
                                </div>
                              </div>

                              <Download className="h-4 w-4 shrink-0" />
                            </a>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No messages available for this query.
              </p>
            )}
          </div>

          {/* Shared composer */}
          <div className="shrink-0 border-t border-border bg-card px-4 py-3">
            <div className="rounded-2xl border border-border bg-muted/20 p-2">
              {/* Edit mode indicator */}
              {editingMessageUuid && (
                <div className="mb-2 flex items-center justify-between px-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Editing message
                  </p>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              )}

              {/* Existing image preview while editing */}
              {editingMessageUuid &&
                editingAttachment &&
                !removeExistingAttachment &&
                !pendingAttachment && (
                  <div className="mb-3">
                    <div className="relative inline-block">
                      <img
                        src={editingAttachment.file_url}
                        alt={editingAttachment.file_name}
                        className="max-h-36 max-w-full rounded-lg border border-border object-contain"
                      />

                      <button
                        type="button"
                        title="Remove existing image"
                        onClick={() =>
                          setRemoveExistingAttachment(true)
                        }
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Existing image
                    </p>
                  </div>
                )}

              {/* Existing image removed indicator */}
              {editingMessageUuid &&
                editingAttachment &&
                removeExistingAttachment &&
                !pendingAttachment && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-dashed border-border p-2 text-xs text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Existing image will be removed.
                    <button
                      type="button"
                      className="ml-auto underline"
                      onClick={() =>
                        setRemoveExistingAttachment(false)
                      }
                    >
                      Undo
                    </button>
                  </div>
                )}

              {/* New image preview */}
              {pendingAttachment &&
                selectedAttachmentPreviewUrl && (
                  <div className="mb-3">
                    <div className="relative inline-block">
                      <img
                        src={selectedAttachmentPreviewUrl}
                        alt={pendingAttachment.name}
                        className="max-h-36 max-w-full rounded-lg border border-border object-contain"
                      />

                      <button
                        type="button"
                        title="Remove selected image"
                        onClick={() => setPendingAttachment(null)}
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}

              {/* New non-image file preview */}
              {pendingAttachment &&
                !selectedAttachmentPreviewUrl && (
                  <div className="mb-3 flex items-center gap-2 rounded-lg border border-border bg-background p-2">
                    <FileText className="h-4 w-4 shrink-0" />

                    <span className="min-w-0 flex-1 truncate text-sm">
                      {pendingAttachment.name}
                    </span>

                    <button
                      type="button"
                      title="Remove attachment"
                      onClick={() => setPendingAttachment(null)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-muted"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

              {/* Composer input */}
              <div className="flex shrink-0 items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleAttachmentSelect}
                  disabled={loading || messageSendingLoading}
                />

                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 shrink-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || messageSendingLoading}
                  title="Attach file"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                <Textarea
                  value={draft}
                  onChange={(event) =>
                    setDraft(event.target.value)
                  }
                  placeholder={
                    editingMessageUuid
                      ? "Edit your message..."
                      : "Write a message to the team"
                  }
                  className="min-h-11 max-h-36 flex-1 resize-none border-0 bg-transparent p-2 shadow-none focus-visible:ring-0"
                  disabled={loading || messageSendingLoading}
                />

                <Button
                  type="button"
                  size="sm"
                  className="h-10 shrink-0 rounded-full px-4"
                  disabled={
                    !canSubmit ||
                    loading ||
                    messageSendingLoading
                  }
                  onClick={handleSubmitMessage}
                >
                  {messageSendingLoading
                    ? "Please wait..."
                    : editingMessageUuid
                      ? "Edit"
                      : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
