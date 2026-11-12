/**
 * Input limits for queries and their messages. Mirrored in the frontend at
 * `src/features/query/query.constants.ts`; keep both in sync.
 */
const QUERY_LIMITS = Object.freeze({
  SUBJECT_MAX: 255, // VARCHAR(255) column
  DESCRIPTION_MAX: 5000,
  MESSAGE_MAX: 5000,
  STATUS_NOTE_MAX: 500,
  SEARCH_MAX: 100,
  FILE_NAME_MAX: 255,
  ATTACHMENT_MAX_BYTES: 10 * 1024 * 1024, // 10 MB
  MEMBERS_PER_REQUEST_MAX: 50,
  PAGE_SIZE_MAX: 100,
});

module.exports = { QUERY_LIMITS };
