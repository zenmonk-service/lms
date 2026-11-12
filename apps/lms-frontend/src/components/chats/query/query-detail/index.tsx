"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowLeft,
  Check,
  Clock3,
  FileText,
  Info,
  Loader2,
  MoreHorizontal,
  Paperclip,
  Pencil,
  SendHorizontal,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  QueryDetail as QueryDetailType,
  QueryMessage,
} from "@/features/query/query.types";
import {
  formatDayLabel,
  formatMessageTime,
  formatQueryDate,
  getInitials,
  getPriorityMeta,
  getStatusMeta,
  isAttachmentOnlyMessage,
  isSameDay,
} from "@/utils/query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store";
import { useAutoFillScroll } from "@/shared/hooks/use-auto-fill-scroll";
import { QueryStatus } from "@repo/common";
import { QueryMembers } from "../query-members";
import { AttachmentThumb } from "./attachment-thumb";
import { DetailItem } from "./detail-item";
import { MessageAttachment } from "./message-attachment";
import {
  LOAD_OLDER_THRESHOLD_PX,
  NEAR_BOTTOM_PX,
  isSameGroup,
  isSystemMessage,
  formatFileSize,
} from "./message-utils";
import {
  ATTACHMENT_MAX_LABEL,
  QUERY_LIMITS,
} from "@/features/query/query.constants";
import { toastError } from "@/shared/toast/toast-error";

interface QueryDetailProps {
  query: QueryDetailType | null;
  loading: boolean;
  messages: QueryMessage[];
  messagesLoading?: boolean;
  messagesLoadingMore?: boolean;
  hasMoreMessages?: boolean;

  onStatusChange?: (queryUuid: string, status: string) => Promise<void>;

  onSendMessage?: (
    queryUuid: string,
    content: string,
    attachment?: File,
  ) => Promise<void>;

  /** Edits only the text; attachments can't be changed. */
  onEditMessage?: (
    queryUuid: string,
    messageUuid: string,
    content: string,
  ) => Promise<void>;

  onDeleteMessage?: (queryUuid: string, messageUuid: string) => Promise<void>;

  onLoadMoreMessages?: () => Promise<void>;

  /** Shown below the xl breakpoint, where the list and chat are separate screens. */
  onBack?: () => void;

  /** Member management; the signed-in user is never offered for adding or removal. */
  onAddMembers?: (queryUuid: string, userUuids: string[]) => Promise<boolean>;
  onRemoveMember?: (queryUuid: string, memberUuid: string) => Promise<void>;
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
  onBack,
  onAddMembers,
  onRemoveMember,
}: QueryDetailProps) {
  const [draft, setDraft] = useState("");
  // Query info is collapsed by default so the conversation gets the height.
  const [showDetails, setShowDetails] = useState(false);
  const [messagePendingDelete, setMessagePendingDelete] = useState<
    string | null
  >(null);
  const [pendingAttachment, setPendingAttachment] = useState<File | null>(null);

  const [editingMessageUuid, setEditingMessageUuid] = useState<string | null>(
    null,
  );

  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesContentRef = useRef<HTMLDivElement | null>(null);

  // Same for older messages: if they don't fill the pane there is nothing to scroll up.
  useAutoFillScroll(messagesContainerRef, {
    enabled: Boolean(
      hasMoreMessages &&
      onLoadMoreMessages &&
      !messagesLoading &&
      !messagesLoadingMore,
    ),
    onLoadMore: () => onLoadMoreMessages?.(),
    contentKey: messages.length,
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const currentUserId = useAppSelector(
    (state) => state.userSlice.currentUser.user_id,
  );

  const { messageSendingLoading } = useAppSelector((state) => state.querySlice);

  // True for the whole send/edit, including the file upload that runs before the API call
  // (messageSendingLoading only covers the API call). While busy, the attachment and edit
  // state must not change, so remove/cancel/undo controls are hidden.
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Counted on the trimmed text, like the backend. The counter appears near the limit.
  const draftLength = draft.trim().length;
  const isDraftTooLong = draftLength > QUERY_LIMITS.MESSAGE_MAX;
  const showDraftCounter = draftLength >= QUERY_LIMITS.MESSAGE_MAX * 0.8;
  const isBusy = isSubmitting || messageSendingLoading;

  // Preview URL for a newly selected image.
  const selectedAttachmentPreviewUrl = useMemo(() => {
    if (!pendingAttachment || !pendingAttachment.type.startsWith("image/")) {
      return "";
    }

    return URL.createObjectURL(pendingAttachment);
  }, [pendingAttachment]);

  useEffect(() => {
    return () => {
      if (selectedAttachmentPreviewUrl) {
        URL.revokeObjectURL(selectedAttachmentPreviewUrl);
      }
    };
  }, [selectedAttachmentPreviewUrl]);

  /* ------------------------------ Scroll handling ----------------------------- */
  // `stickToBottom`: the user is at (or near) the latest message, so new messages keep
  // the view pinned to the bottom. When they scrolled up to read history, realtime
  // messages must not yank them down; a "new messages" button appears instead.
  const stickToBottomRef = useRef(true);
  const [unseenCount, setUnseenCount] = useState(0);
  // What was rendered last time, to tell "older page prepended" from "new message appended".
  const renderedRef = useRef<{
    firstUuid?: string;
    lastUuid?: string;
    scrollHeight: number;
  }>({ scrollHeight: 0 });

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
    stickToBottomRef.current = true;
    setUnseenCount(0);
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = distanceFromBottom < NEAR_BOTTOM_PX;
    if (stickToBottomRef.current) setUnseenCount(0);
    renderedRef.current.scrollHeight = container.scrollHeight;

    // Near the top: load older messages. The guard in the parent ignores repeats.
    if (
      container.scrollTop <= LOAD_OLDER_THRESHOLD_PX &&
      hasMoreMessages &&
      !messagesLoading &&
      !messagesLoadingMore
    ) {
      void onLoadMoreMessages?.();
    }
  };

  // Runs before paint, so position corrections never flash.
  useLayoutEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const previous = renderedRef.current;
    const firstUuid = messages[0]?.uuid;
    const lastUuid = messages[messages.length - 1]?.uuid;

    if (!lastUuid) {
      // Chat switched or cleared: the next load starts at the bottom again.
      stickToBottomRef.current = true;
      setUnseenCount(0);
    } else if (!previous.lastUuid) {
      // First page of this chat.
      container.scrollTop = container.scrollHeight;
    } else if (lastUuid !== previous.lastUuid) {
      const previousIndex = messages.findIndex(
        (message) => message.uuid === previous.lastUuid,
      );
      const newest = messages[messages.length - 1];
      const isMine = newest.sender?.user_id === currentUserId;

      if (stickToBottomRef.current) {
        container.scrollTop = container.scrollHeight;
      } else if (previousIndex !== -1) {
        // New message(s) at the bottom while reading history: mine jump down, others are counted.
        if (isMine) {
          container.scrollTop = container.scrollHeight;
          stickToBottomRef.current = true;
          setUnseenCount(0);
        } else {
          setUnseenCount(
            (count) => count + (messages.length - 1 - previousIndex),
          );
        }
      }
      // previousIndex === -1: the newest message was deleted; nothing new to show.
    } else if (firstUuid !== previous.firstUuid) {
      // Older page prepended: keep the same messages under the user's eyes.
      container.scrollTop += container.scrollHeight - previous.scrollHeight;
    }

    renderedRef.current = {
      firstUuid,
      lastUuid,
      scrollHeight: container.scrollHeight,
    };
  }, [messages, currentUserId]);

  // Late layout changes (images loading, details panel, resize): stay at the bottom if
  // the user was there, and keep the recorded height current for prepend corrections.
  useEffect(() => {
    const container = messagesContainerRef.current;
    const content = messagesContentRef.current;
    if (!container || !content) return;

    const observer = new ResizeObserver(() => {
      if (stickToBottomRef.current) {
        container.scrollTop = container.scrollHeight;
      }
      renderedRef.current.scrollHeight = container.scrollHeight;
    });
    observer.observe(content);
    observer.observe(container);
    return () => observer.disconnect();
  }, [query?.uuid, loading]);

  // Select a new attachment.
  const handleAttachmentSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;

    if (file && file.size > QUERY_LIMITS.ATTACHMENT_MAX_BYTES) {
      toastError(`Attachments must be ${ATTACHMENT_MAX_LABEL} or smaller.`);
    } else if (file && file.name.length > QUERY_LIMITS.FILE_NAME_MAX) {
      toastError("That file name is too long. Rename the file and try again.");
    } else if (file) {
      setPendingAttachment(file);
    }

    // Allows selecting the same file again.
    event.target.value = "";
  };

  // Enter edit mode with the message text in the composer. Only text is editable.
  const handleEditMessage = (message: QueryMessage) => {
    setEditingMessageUuid(message.uuid);
    setDraft(message.content ?? "");
    setPendingAttachment(null);
  };

  const handleCancelEdit = () => {
    setEditingMessageUuid(null);
    setPendingAttachment(null);
    setDraft("");
  };

  // Send a new message or update an existing message.
  const handleSubmitMessage = async () => {
    // Enter bypasses the disabled send button, so the length is checked here too.
    if (!query || isBusy || isDraftTooLong) return;

    const content = draft.trim();

    if (editingMessageUuid) {
      if (!onEditMessage || !content) return;

      setIsSubmitting(true);
      try {
        await onEditMessage(query.uuid, editingMessageUuid, content);
        handleCancelEdit();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!content && !pendingAttachment) return;
    if (!onSendMessage) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(query.uuid, content, pendingAttachment ?? undefined);
      setDraft("");
      setPendingAttachment(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    // Enter sends, Shift+Enter inserts a newline. Ignore while an IME composition is active.
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      void handleSubmitMessage();
    }
    if (event.key === "Escape" && editingMessageUuid && !isBusy) {
      handleCancelEdit();
    }
  };

  const confirmDelete = async () => {
    if (!query || !messagePendingDelete) return;
    const uuid = messagePendingDelete;
    setMessagePendingDelete(null);
    await onDeleteMessage?.(query.uuid, uuid);
    if (editingMessageUuid === uuid) handleCancelEdit();
  };

  const backButton = onBack ? (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="-ml-1 h-9 w-9 shrink-0 rounded-full xl:hidden"
      onClick={onBack}
      aria-label="Back to all queries"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  ) : null;

  if (loading || !query) {
    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 bg-card sm:rounded-2xl sm:border sm:border-border">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-3">
          {backButton}
          {loading && (
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          )}
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading conversation…
            </>
          ) : (
            "Select a query to view the thread."
          )}
        </div>
      </section>
    );
  }

  const canSubmit =
    !isDraftTooLong &&
    (editingMessageUuid
      ? Boolean(draft.trim()) && Boolean(onEditMessage)
      : Boolean(draft.trim() || pendingAttachment) && Boolean(onSendMessage));

  const status = getStatusMeta(query.status);
  const priority = getPriorityMeta(query.priority);
  const memberCount = query.members?.length ?? 0;

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 bg-card sm:rounded-2xl sm:border sm:border-border">
      {/* Header */}
      <header className="shrink-0 border-b border-border">
        <div className="flex items-center gap-1.5 px-2 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
          {backButton}

          <Avatar className="hidden h-10 w-10 shrink-0 sm:flex">
            <AvatarImage
              src={query.creator?.image ?? undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
              {getInitials(query.creator?.name)}
            </AvatarFallback>
          </Avatar>

          <button
            type="button"
            onClick={() => setShowDetails((open) => !open)}
            className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={showDetails}
          >
            <h2 className="truncate text-base font-semibold leading-tight text-foreground sm:text-lg">
              {query.subject}
            </h2>
            {/* Ticket number always shows in full; only the creator/member part gets "…". */}
            <p className="mt-0.5 flex min-w-0 items-center text-xs text-muted-foreground">
              <span className="shrink-0 whitespace-nowrap font-mono tracking-tight">
                {query.ticket_number}
              </span>
              <span className="truncate">
                <span className="mx-1.5">·</span>
                {query.creator?.name ?? "Unknown"}
                {memberCount > 0 && (
                  <>
                    <span className="mx-1.5">·</span>
                    {memberCount} {memberCount === 1 ? "member" : "members"}
                  </>
                )}
              </span>
            </p>
          </button>

          <Select
            value={query.status}
            onValueChange={(value) => onStatusChange?.(query.uuid, value)}
          >
            <SelectTrigger
              className={cn(
                "h-8 w-auto shrink-0 gap-1.5 rounded-full border-0 px-3 text-xs font-medium shadow-none ring-1 ring-inset",
                status.className,
              )}
              aria-label="Change status"
            >
              <span className={cn("h-2 w-2 rounded-full", status.dot)} />
              <span className="hidden sm:inline">{status.label}</span>
            </SelectTrigger>
            {/* The shared SelectContent shrinks to the trigger (max-w-min break-all); this menu sizes to its labels. */}
            <SelectContent
              align="end"
              className="min-w-44 max-w-none break-normal"
            >
              {QueryStatus.getValues().map((value) => {
                const meta = getStatusMeta(value as string);
                return (
                  <SelectItem key={value} value={value as string}>
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full",
                          meta.dot,
                        )}
                      />
                      {meta.label}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant={showDetails ? "secondary" : "ghost"}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full"
            onClick={() => setShowDetails((open) => !open)}
            aria-expanded={showDetails}
            aria-label="Query details"
          >
            <Info className="h-[18px] w-[18px]" />
          </Button>
        </div>

        {/* Collapsible details */}
        {showDetails && (
          <div className="max-h-[40vh] space-y-3 overflow-y-auto border-t border-border bg-muted/30 px-3 py-3 sm:px-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs sm:grid-cols-4">
              <DetailItem
                icon={<Tag className="h-3.5 w-3.5" />}
                label="Module"
                value={query.module}
              />
              <DetailItem
                icon={
                  <span className={cn("h-2 w-2 rounded-full", priority.dot)} />
                }
                label="Priority"
                value={
                  <span className={priority.className}>{query.priority}</span>
                }
              />
              <DetailItem
                icon={<Clock3 className="h-3.5 w-3.5" />}
                label="Created"
                value={formatQueryDate(query.created_at)}
              />
            </dl>

            <QueryMembers
              queryUuid={query.uuid}
              members={query.members ?? []}
              currentUserId={currentUserId}
              onAddMembers={onAddMembers}
              onRemoveMember={onRemoveMember}
            />

            {query.description && (
              <p className="whitespace-pre-wrap rounded-xl bg-card p-3 text-sm leading-relaxed text-foreground ring-1 ring-border [overflow-wrap:anywhere]">
                {query.description}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleMessagesScroll}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-muted/30 px-2 py-3 [overflow-anchor:none] sm:px-6 sm:py-4"
      >
        {/* Zero-height overlay so the spinner never shifts the messages. */}
        {messagesLoadingMore && (
          <div className="sticky top-0 z-20 flex h-0 justify-center overflow-visible">
            <span className="mt-1 rounded-full bg-card p-1.5 shadow-sm ring-1 ring-border">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </span>
          </div>
        )}

        <div ref={messagesContentRef}>
          {messagesLoading && !messages.length ? (
            <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading messages…
            </div>
          ) : (
            messages.map((message, index) => {
              const previous = messages[index - 1];
              const next = messages[index + 1];
              const isSystem = isSystemMessage(message);
              const isCurrentUser = message.sender?.user_id === currentUserId;
              const canModify = isCurrentUser && !isSystem;
              // An image/video/file sent without text can be deleted but not edited.
              const canEdit = canModify && !isAttachmentOnlyMessage(message);
              const senderName = message.sender?.name ?? "System";
              const showDay =
                !previous ||
                !isSameDay(previous.created_at, message.created_at);
              const isFirstInGroup =
                isSystem || showDay || !isSameGroup(message, previous);
              const isLastInGroup = isSystem || !isSameGroup(message, next);
              const isEdited = Boolean(
                message.updated_at && message.updated_at !== message.created_at,
              );
              const isBeingEdited = editingMessageUuid === message.uuid;

              return (
                <React.Fragment key={message.uuid}>
                  {showDay && (
                    <div className="sticky top-0 z-10 my-3 flex justify-center first:mt-0">
                      <span className="rounded-full bg-card/90 px-3 py-1 text-[11px] font-medium text-muted-foreground shadow-sm ring-1 ring-border backdrop-blur">
                        {formatDayLabel(message.created_at)}
                      </span>
                    </div>
                  )}

                  {isSystem ? (
                    <div className="my-3 flex justify-center">
                      <p className="max-w-[90%] rounded-lg bg-card/80 px-3 py-1.5 text-center text-xs leading-relaxed text-muted-foreground ring-1 ring-border [overflow-wrap:anywhere]">
                        {message.content}
                        <span className="ml-2 text-[10px] opacity-70">
                          {formatMessageTime(message.created_at)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <div
                      className={cn(
                        "group flex items-end gap-2",
                        isCurrentUser ? "justify-end" : "justify-start",
                        isFirstInGroup ? "mt-3" : "mt-0.5",
                      )}
                    >
                      {!isCurrentUser && (
                        <div className="w-8 shrink-0">
                          {isLastInGroup && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={message.sender?.image ?? undefined}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                                {getInitials(senderName)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      )}

                      {canModify && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 self-center rounded-full text-muted-foreground opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100 [@media(hover:none)]:opacity-100"
                              aria-label="Message actions"
                              disabled={isBusy}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            {canEdit && (
                              <DropdownMenuItem
                                onClick={() => handleEditMessage(message)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() =>
                                setMessagePendingDelete(message.uuid)
                              }
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      <div
                        className={cn(
                          "min-w-0 max-w-[85%] px-3.5 pb-1.5 pt-2 shadow-sm sm:max-w-[70%]",
                          "rounded-2xl",
                          isCurrentUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-foreground ring-1 ring-border",
                          isCurrentUser && isLastInGroup && "rounded-br-md",
                          !isCurrentUser && isLastInGroup && "rounded-bl-md",
                          isBeingEdited &&
                            "ring-2 ring-ring ring-offset-2 ring-offset-background",
                        )}
                      >
                        {!isCurrentUser && isFirstInGroup && (
                          <p className="mb-0.5 text-xs font-semibold text-primary">
                            {senderName}
                          </p>
                        )}

                        {message.attachment && (
                          <MessageAttachment
                            attachment={message.attachment}
                            isOwn={isCurrentUser}
                            hasText={Boolean(message.content)}
                          />
                        )}

                        {message.content ? (
                          <p className="whitespace-pre-wrap text-sm leading-relaxed [overflow-wrap:anywhere]">
                            {message.content}
                          </p>
                        ) : null}

                        {/* Meta sits on its own line below the text so it never overlaps it. */}
                        <span
                          className={cn(
                            "mt-1 flex items-center justify-end gap-1 text-[10px] leading-none",
                            isCurrentUser
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground",
                          )}
                        >
                          {isEdited && (
                            <>
                              <Pencil className="h-2.5 w-2.5" aria-hidden />
                              <span>edited</span>
                              <span aria-hidden>·</span>
                            </>
                          )}
                          <time dateTime={message.created_at}>
                            {formatMessageTime(message.created_at)}
                          </time>
                        </span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>

      {unseenCount > 0 && (
        <div className="pointer-events-none relative z-20 h-0">
          <Button
            type="button"
            size="sm"
            onClick={() => scrollToBottom("smooth")}
            className="pointer-events-auto absolute bottom-3 left-1/2 h-8 -translate-x-1/2 gap-1.5 rounded-full px-3 text-xs shadow-md"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            {unseenCount === 1
              ? "1 new message"
              : `${unseenCount} new messages`}
          </Button>
        </div>
      )}

      {/* Composer */}
      <footer className="shrink-0 border-t border-border bg-card px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 sm:px-4 sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-3">
        {editingMessageUuid && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border-l-4 border-primary bg-muted/60 px-3 py-2">
            <Pencil className="h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="flex-1 text-xs font-medium text-foreground">
              {isBusy ? "Saving changes…" : "Editing message"}
            </p>
            {!isBusy && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={handleCancelEdit}
                aria-label="Cancel editing"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}

        {pendingAttachment && selectedAttachmentPreviewUrl && (
          <AttachmentThumb
            src={selectedAttachmentPreviewUrl}
            alt={pendingAttachment.name}
            onRemove={isBusy ? undefined : () => setPendingAttachment(null)}
          />
        )}

        {pendingAttachment && !selectedAttachmentPreviewUrl && (
          <div className="mb-2 flex items-center gap-3 rounded-xl bg-muted/60 px-3 py-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {pendingAttachment.name}
              </span>
              <span className="block text-xs text-muted-foreground">
                {formatFileSize(pendingAttachment.size)}
              </span>
            </span>
            {isBusy ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => setPendingAttachment(null)}
                aria-label="Remove attachment"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleAttachmentSelect}
            disabled={loading || isBusy}
          />

          <div className="flex min-w-0 flex-1 items-end rounded-3xl border border-input bg-background pl-1 pr-2 transition-shadow focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/30">
            {/* Attachments can't be added or changed while editing. */}
            {editingMessageUuid ? (
              <span className="w-2 shrink-0" aria-hidden />
            ) : (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="mb-1 h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || isBusy}
                aria-label="Attach file"
              >
                <Paperclip className="h-[18px] w-[18px]" />
              </Button>
            )}

            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleComposerKeyDown}
              rows={1}
              placeholder={
                editingMessageUuid ? "Edit your message…" : "Type a message"
              }
              className="max-h-36 min-h-11 w-0 min-w-0 flex-1 resize-none overflow-y-auto border-0 bg-transparent px-1 py-3 text-sm shadow-none [overflow-wrap:anywhere] focus-visible:ring-0 dark:bg-transparent"
              disabled={loading || isBusy}
              aria-invalid={isDraftTooLong || undefined}
            />
          </div>

          <Button
            type="button"
            size="icon"
            className="h-11 w-11 shrink-0 rounded-full shadow-sm"
            disabled={!canSubmit || loading || isBusy}
            onClick={handleSubmitMessage}
            aria-label={editingMessageUuid ? "Save edit" : "Send message"}
          >
            {isBusy ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : editingMessageUuid ? (
              <Check className="h-5 w-5" />
            ) : (
              <SendHorizontal className="h-5 w-5" />
            )}
          </Button>
        </div>

        <div className="mt-1.5 flex items-center gap-2 px-3 text-[11px] text-muted-foreground">
          <p className="hidden sm:block">
            <kbd className="font-sans font-medium">Enter</kbd> to send ·{" "}
            <kbd className="font-sans font-medium">Shift + Enter</kbd> for a new
            line
          </p>
          {showDraftCounter && (
            <p
              className={cn(
                "ml-auto tabular-nums",
                isDraftTooLong && "font-medium text-destructive",
              )}
              aria-live="polite"
            >
              {isDraftTooLong
                ? `Message is too long · ${draftLength.toLocaleString()} / ${QUERY_LIMITS.MESSAGE_MAX.toLocaleString()}`
                : `${draftLength.toLocaleString()} / ${QUERY_LIMITS.MESSAGE_MAX.toLocaleString()}`}
            </p>
          )}
        </div>
      </footer>

      <AlertDialog
        open={Boolean(messagePendingDelete)}
        onOpenChange={(open) => !open && setMessagePendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed for everyone in this query. This can&apos;t be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
