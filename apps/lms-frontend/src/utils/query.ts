export const formatQueryDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export const formatPriority = (priority?: string | null) =>
  priority ?? "Medium";
export const formatStatus = (status?: string | null) => status ?? "OPEN";
export const formatModule = (module?: string | null) => module ?? "Other";

const STATUS_META: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  OPEN: {
    label: "Open",
    className: "bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  IN_PROGRESS: {
    label: "In progress",
    className:
      "bg-violet-500/10 text-violet-700 ring-violet-500/20 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  PENDING_EMP: {
    label: "Pending employee",
    className:
      "bg-amber-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  RESOLVED: {
    label: "Resolved",
    className:
      "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
};

const PRIORITY_META: Record<string, { className: string; dot: string }> = {
  Low: { className: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
  Medium: {
    className: "text-amber-700 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  High: {
    className: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  Urgent: { className: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
};

export const getStatusMeta = (status?: string | null) => {
  const key = formatStatus(status);
  return (
    STATUS_META[key] ?? {
      label: key
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase()),
      className: "bg-muted text-muted-foreground ring-border",
      dot: "bg-muted-foreground",
    }
  );
};

export const getPriorityMeta = (priority?: string | null) =>
  PRIORITY_META[formatPriority(priority)] ?? PRIORITY_META.Medium;

export const getInitials = (name?: string | null) =>
  (name ?? "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** "14:05" for today, "Yesterday", weekday within a week, else "12 Nov". Used in the query list. */
export const formatRelativeShort = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000,
  );
  if (days === 0) return formatMessageTime(value);
  if (days === 1) return "Yesterday";
  if (days < 7)
    return new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
  }).format(date);
};

export const formatMessageTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/** Day separator label for the conversation: Today / Yesterday / 12 November 2026. */
export const formatDayLabel = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86_400_000,
  );
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const isSameDay = (a?: string | null, b?: string | null) =>
  Boolean(a && b) && startOfDay(new Date(a!)) === startOfDay(new Date(b!));

/**
 * Content stored for a file sent without text. Keep in sync with
 * `attachmentOnlyContent` in the backend query service.
 */
export const attachmentOnlyContent = (fileName?: string | null) =>
  `Sent an attachment: ${fileName ?? ""}`;

/** Image/video/file sent without typed text: shown as-is and cannot be edited. */
export const isAttachmentOnlyMessage = (message: {
  content?: string | null;
  attachment?: { file_name?: string | null } | null;
}) =>
  Boolean(
    message.attachment &&
    (!message.content?.trim() ||
      message.content === attachmentOnlyContent(message.attachment.file_name)),
  );
