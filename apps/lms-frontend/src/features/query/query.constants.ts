/**
 * Input limits for queries and their messages. Mirrors the backend's
 * `lib/query-limits.js`; keep both in sync.
 */
export const QUERY_LIMITS = {
  SUBJECT_MAX: 255,
  DESCRIPTION_MAX: 5000,
  MESSAGE_MAX: 5000,
  STATUS_NOTE_MAX: 500,
  SEARCH_MAX: 100,
  FILE_NAME_MAX: 255,
  ATTACHMENT_MAX_BYTES: 10 * 1024 * 1024,
  MEMBERS_PER_REQUEST_MAX: 50,
} as const;

export const ATTACHMENT_MAX_LABEL = `${QUERY_LIMITS.ATTACHMENT_MAX_BYTES / (1024 * 1024)} MB`;
