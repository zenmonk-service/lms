import { QueryAttachment, QueryMessage } from "@/features/query/query.types";
import { isSameDay } from "@/utils/query";

/** Consecutive messages from one sender within this window are visually grouped. */
export const GROUP_WINDOW_MS = 5 * 60 * 1000;
/** Within this distance of the bottom the chat follows new messages. */
export const NEAR_BOTTOM_PX = 120;
/** Older messages start loading this close to the top. */
export const LOAD_OLDER_THRESHOLD_PX = 120;

export const getAttachmentType = (attachment?: QueryAttachment | null) => {
  const type = attachment?.meta_data?.type;
  return typeof type === "string" ? type : "";
};

export const isImageAttachment = (attachment?: QueryAttachment | null) =>
  getAttachmentType(attachment).startsWith("image/");

export const getAttachmentSize = (attachment?: QueryAttachment | null) => {
  const size = attachment?.meta_data?.size;
  return typeof size === "number" ? size : null;
};

export const formatFileSize = (size: number | null) => {
  if (!size) return "Unknown size";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  return `${(size / 1024).toFixed(2)} KB`;
};

export const isSystemMessage = (message?: QueryMessage) =>
  message?.message_type === "SYSTEM";

/** True when two messages render as one visual group (same sender, same day, close in time). */
export const isSameGroup = (message: QueryMessage, other?: QueryMessage) =>
  Boolean(other) &&
  !isSystemMessage(other) &&
  other!.sender?.user_id === message.sender?.user_id &&
  isSameDay(other!.created_at, message.created_at) &&
  Math.abs(
    new Date(other!.created_at).getTime() -
      new Date(message.created_at).getTime(),
  ) < GROUP_WINDOW_MS;
