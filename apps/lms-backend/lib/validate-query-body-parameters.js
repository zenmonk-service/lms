const { BadRequestError } = require("../middleware/error");
const {
  QueryModule,
  QueryPriority,
  QueryStatus,
  QueryMessageType,
  QueryMemberRole,
} = require("@repo/common");
const { QUERY_LIMITS } = require("./query-limits");

/**
 * Routes validated by `validateQueryBodyParameters`. Kept here instead of
 * `CreateRoute` in @repo/common so the query feature doesn't need a package rebuild.
 */
const QueryRoute = Object.freeze({
  CREATE_QUERY: "CREATE_QUERY",
  UPDATE_QUERY: "UPDATE_QUERY",
  CHANGE_QUERY_STATUS: "CHANGE_QUERY_STATUS",
  CREATE_QUERY_MESSAGE: "CREATE_QUERY_MESSAGE",
  UPDATE_QUERY_MESSAGE: "UPDATE_QUERY_MESSAGE",
  ADD_QUERY_ATTACHMENT: "ADD_QUERY_ATTACHMENT",
  ADD_QUERY_MEMBERS: "ADD_QUERY_MEMBERS",
});

/* --------------------------------- Readers -------------------------------- */

/**
 * Trims and checks a text field: returns the trimmed text, or `undefined` when an
 * optional field is absent.
 */
function readText(value, { label, max, required = false }) {
  if (value === undefined || value === null) {
    if (required) throw new BadRequestError(`${label} is required.`);
    return undefined;
  }
  if (typeof value !== "string") {
    throw new BadRequestError(`${label} must be text.`);
  }

  const text = value.trim();
  if (required && !text) {
    throw new BadRequestError(`${label} is required.`);
  }
  if (text.length > max) {
    throw new BadRequestError(
      `${label} is too long.`,
      `${label} must be ${max} characters or fewer.`,
    );
  }
  return text;
}

/** Empty -> null; otherwise must parse as a date. */
function readOptionalDate(value, label) {
  if (value === undefined || value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new BadRequestError(
      `Invalid ${label}.`,
      `${label} must be a valid date.`,
    );
  }
  return date;
}

function assertValidEnum(enumType, value, label) {
  if (!enumType.isValidValue(value)) {
    throw new BadRequestError(
      `Invalid ${label}.`,
      `${label} must be one of: ${enumType.getValues().join(", ")}`,
    );
  }
}

/** Checks an uploaded file (multer) or attachment metadata sent in the body. */
function assertValidAttachment(fileData) {
  readText(fileData.originalname ?? fileData.file_name, {
    label: "File name",
    max: QUERY_LIMITS.FILE_NAME_MAX,
    required: true,
  });

  const size = fileData.size ?? fileData.meta_data?.size;
  if (typeof size === "number" && size > QUERY_LIMITS.ATTACHMENT_MAX_BYTES) {
    throw new BadRequestError(
      "Attachment is too large.",
      `Attachment must be ${QUERY_LIMITS.ATTACHMENT_MAX_BYTES / (1024 * 1024)} MB or smaller.`,
    );
  }
}

/** Unique, trimmed user uuids from arrays, comma separated strings or single values. */
function readUserUuids(...candidates) {
  const values = candidates.flatMap((candidate) => {
    if (candidate === undefined || candidate === null || candidate === "") {
      return [];
    }
    if (Array.isArray(candidate)) return candidate;
    if (typeof candidate === "string") return candidate.split(",");
    return [candidate];
  });

  const uuids = [
    ...new Set(values.map((value) => String(value).trim()).filter(Boolean)),
  ];
  if (uuids.length > QUERY_LIMITS.MEMBERS_PER_REQUEST_MAX) {
    throw new BadRequestError(
      "Too many users.",
      `You can add at most ${QUERY_LIMITS.MEMBERS_PER_REQUEST_MAX} people at once.`,
    );
  }
  return uuids;
}

const readMessageContent = (value) =>
  readText(value, {
    label: "Message",
    max: QUERY_LIMITS.MESSAGE_MAX,
    required: true,
  });

/* -------------------------------- Validators ------------------------------- */

/**
 * Validates `payload.body` for a query route and replaces it with clean values
 * (trimmed text, parsed dates, defaults). Mirrors `validateBodyParameters`.
 */
exports.validateQueryBodyParameters = ({ payload, route }) => {
  const body = payload.body ?? {};

  switch (route) {
    case QueryRoute.CREATE_QUERY: {
      const priority = body.priority ?? QueryPriority.ENUM.MEDIUM;
      if (!body.module) throw new BadRequestError("Module is required.");
      assertValidEnum(QueryModule, body.module, "Module");
      assertValidEnum(QueryPriority, priority, "Priority");

      const attachment = body.attachment || payload.file;
      if (attachment) assertValidAttachment(attachment);

      payload.body = {
        subject: readText(body.subject, {
          label: "Subject",
          max: QUERY_LIMITS.SUBJECT_MAX,
          required: true,
        }),
        description: readText(body.description, {
          label: "Description",
          max: QUERY_LIMITS.DESCRIPTION_MAX,
          required: true,
        }),
        initial_message: readText(body.initial_message, {
          label: "Initial message",
          max: QUERY_LIMITS.MESSAGE_MAX,
        }),
        module: body.module,
        priority,
        sla_due_at: readOptionalDate(body.sla_due_at, "SLA due date"),
        assignee_uuids: readUserUuids(
          body.assignee_id,
          body.assignee_ids,
          body.assignee_uuids,
        ),
        attachment,
      };
      break;
    }

    case QueryRoute.UPDATE_QUERY: {
      // Only fields present in the body change; present text fields can't be blank.
      const updates = {};
      if (body.subject !== undefined) {
        updates.subject = readText(body.subject, {
          label: "Subject",
          max: QUERY_LIMITS.SUBJECT_MAX,
          required: true,
        });
      }
      if (body.description !== undefined) {
        updates.description = readText(body.description, {
          label: "Description",
          max: QUERY_LIMITS.DESCRIPTION_MAX,
          required: true,
        });
      }
      if (body.sla_due_at !== undefined) {
        updates.sla_due_at = readOptionalDate(body.sla_due_at, "SLA due date");
      }
      if (body.module !== undefined) {
        assertValidEnum(QueryModule, body.module, "Module");
        updates.module = body.module;
      }
      if (body.priority !== undefined) {
        assertValidEnum(QueryPriority, body.priority, "Priority");
        updates.priority = body.priority;
      }
      payload.body = updates;
      break;
    }

    case QueryRoute.CHANGE_QUERY_STATUS: {
      if (!body.status) throw new BadRequestError("Status is required.");
      assertValidEnum(QueryStatus, body.status, "Status");
      payload.body = {
        status: body.status,
        note: readText(body.note, {
          label: "Note",
          max: QUERY_LIMITS.STATUS_NOTE_MAX,
        }),
      };
      break;
    }

    case QueryRoute.CREATE_QUERY_MESSAGE: {
      const messageType = body.message_type ?? QueryMessageType.ENUM.PUBLIC;
      assertValidEnum(QueryMessageType, messageType, "Message type");

      const attachment = payload.file || body.attachment;
      if (attachment) assertValidAttachment(attachment);

      payload.body = {
        content: readMessageContent(body.content),
        message_type: messageType,
        attachment,
        attachment_uuid: body.attachment_id || undefined,
      };
      break;
    }

    case QueryRoute.UPDATE_QUERY_MESSAGE: {
      payload.body = { content: readMessageContent(body.content) };
      break;
    }

    case QueryRoute.ADD_QUERY_ATTACHMENT: {
      const attachment = payload.file || {
        file_name: body.file_name,
        file_url: body.file_url,
        meta_data: body.meta_data,
      };
      assertValidAttachment(attachment);
      payload.body = { attachment, message_uuid: body.message_uuid };
      break;
    }

    case QueryRoute.ADD_QUERY_MEMBERS: {
      const role = body.role ?? QueryMemberRole.ENUM.ASSIGNEE;
      assertValidEnum(QueryMemberRole, role, "Member role");

      const userUuids = readUserUuids(
        body.user_uuids,
        body.user_uuid,
        body.user_id,
      );
      if (!userUuids.length) {
        throw new BadRequestError("Select at least one user to add.");
      }
      payload.body = { user_uuids: userUuids, role };
      break;
    }

    default:
      throw new Error(`Unknown query route: ${route}`);
  }

  return payload;
};

/** Normalizes the list query string: search length, paging, archive flag. */
exports.validateQueryListParameters = (payload) => {
  const query = payload.query ?? {};

  payload.query = {
    ...query,
    search: readText(query.search, {
      label: "Search",
      max: QUERY_LIMITS.SEARCH_MAX,
    }),
    archive: query.archive === "true" || query.archive === true,
    only_my_queries:
      query.only_my_queries === "true" || payload.headers?.is_me === "true",
  };
  return payload;
};

exports.QueryRoute = QueryRoute;
