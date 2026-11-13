const {
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
  BadRequestError,
} = require("../middleware/error");
const {
  QueryStatus,
  QueryMessageType,
  QueryMemberRole,
  QueryEvent,
} = require("@repo/common");
const { queryRepository } = require("../repositories/query-repository");
const {
  queryMessageRepository,
} = require("../repositories/query-message-repository");
const {
  queryMemberRepository,
} = require("../repositories/query-member-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  attachmentRepository,
} = require("../repositories/attachment-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const {
  publishQueryEvent,
  publishOrganizationQueryEvent,
} = require("../lib/query-events");
const {
  QueryRoute,
  validateQueryBodyParameters,
  validateQueryListParameters,
} = require("../lib/validate-query-body-parameters");

/* -------------------------------------------------------------------------- */
/*                                   Queries                                  */
/* -------------------------------------------------------------------------- */

exports.getFilteredQueries = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  payload = validateQueryListParameters(payload);

  const {
    status,
    priority,
    module,
    search,
    only_my_queries,
    archive,
    page = 1,
    limit = 10,
  } = payload.query;

  // The list only contains queries the user created or is a member of.
  return queryRepository.getFilteredQueries(
    {
      status,
      priority,
      module,
      search,
      creator_id: only_my_queries ? currentUser.id : undefined,
      accessible_by: currentUser.id,
    },
    { archive, page, limit },
  );
};

exports.getQueryByUUID = async (payload) => findAccessibleQuery(payload);

exports.createQuery = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  payload = validateQueryBodyParameters({
    payload,
    route: QueryRoute.CREATE_QUERY,
  });
  const {
    subject,
    description,
    initial_message,
    module,
    priority,
    sla_due_at,
    assignee_uuids,
    attachment,
  } = payload.body;

  // The creator is the primary assignee; other assignees are resolved before the transaction.
  const assignees = (await findUsersByUUIDs(assignee_uuids)).filter(
    (user) => user.id !== currentUser.id,
  );

  // Creator and ticket number always come from the authenticated requester, never the body.
  const ticketNumber = await queryRepository.generateUniqueTicketNumber(
    currentUser,
    new Date(),
  );

  const transaction = await transactionRepository.startTransaction();
  try {
    const query = await queryRepository.createQuery(
      {
        ticket_number: ticketNumber,
        creator_id: currentUser.id,
        module,
        subject,
        description,
        priority,
        status: QueryStatus.ENUM.OPEN,
        sla_due_at,
      },
      transaction,
    );

    const assignedAt = new Date();
    await queryMemberRepository.createMembers(
      {
        query_id: query.id,
        user_ids: [currentUser.id],
        role: QueryMemberRole.ENUM.PRIMARY_ASSIGNEE,
        assigned_by: currentUser.id,
        assigned_at: assignedAt,
      },
      transaction,
    );
    if (assignees.length) {
      await queryMemberRepository.createMembers(
        {
          query_id: query.id,
          user_ids: assignees.map((user) => user.id),
          role: QueryMemberRole.ENUM.ASSIGNEE,
          assigned_by: currentUser.id,
          assigned_at: assignedAt,
        },
        transaction,
      );
    }

    const createdAttachment = attachment
      ? await createAttachment(attachment, transaction)
      : null;

    await queryMessageRepository.createMessage(
      {
        query_id: query.id,
        sender_id: currentUser.id,
        message_type: QueryMessageType.ENUM.PUBLIC,
        content: initial_message || description,
        attachment_id: createdAttachment?.id ?? null,
      },
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
    return query;
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.updateQuery = async (payload) => {
  const query = await findAccessibleQuery(payload);
  payload = validateQueryBodyParameters({
    payload,
    route: QueryRoute.UPDATE_QUERY,
  });

  return queryRepository.updateQueryById(query.id, payload.body);
};

exports.changeQueryStatus = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const query = await findAccessibleQuery(payload);
  payload = validateQueryBodyParameters({
    payload,
    route: QueryRoute.CHANGE_QUERY_STATUS,
  });
  const { status, note } = payload.body;

  const updates = {
    status,
    resolved_at: status === QueryStatus.ENUM.RESOLVED ? new Date() : null,
  };

  const transaction = await transactionRepository.startTransaction();
  let systemMessage;
  try {
    await queryRepository.updateQueryById(query.id, updates, transaction);

    const noteText = note ? ` Note: ${note}` : "";
    systemMessage = await createSystemMessage(
      query,
      currentUser,
      `Status changed from ${query.status} to ${status} by ${currentUser.name}.${noteText}`,
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }

  const result = {
    query_uuid: query.uuid,
    status: updates.status,
    resolved_at: updates.resolved_at,
    message: await loadMessage(systemMessage.uuid),
  };

  // The chat gets the system message; every open list only needs the new status.
  await Promise.all([
    publishQueryEvent(payload, query, QueryEvent.ENUM.STATUS_CHANGED, result),
    publishOrganizationQueryEvent(payload, QueryEvent.ENUM.STATUS_CHANGED, {
      query_uuid: query.uuid,
      status: result.status,
      resolved_at: result.resolved_at,
    }),
  ]);

  return result;
};

exports.deleteQuery = async (payload) => {
  const query = await findAccessibleQuery(payload);

  // Permanent delete of the query and everything in it, atomically.
  const transaction = await transactionRepository.startTransaction();
  try {
    await queryMessageRepository.deleteMessagesByQueryId(query.id, transaction);
    await queryMemberRepository.deleteMembersByQueryId(query.id, transaction);
    await queryRepository.deleteQueryById(query.id, transaction);

    await transactionRepository.commitTransaction(transaction);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.getQueryMessages = async (payload) => {
  const query = await findAccessibleQuery(payload);
  const { limit = 50, before, message_type } = payload.query;

  return queryMessageRepository.getMessagesByQueryId(query.id, {
    limit,
    before,
    message_type,
  });
};

exports.createQueryMessage = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const query = await findAccessibleQuery(payload);
  payload = validateQueryBodyParameters({
    payload,
    route: QueryRoute.CREATE_QUERY_MESSAGE,
  });
  const { content, message_type, attachment, attachment_uuid } = payload.body;

  const transaction = await transactionRepository.startTransaction();
  let message;
  try {
    // An uploaded file (or attachment metadata) takes precedence over an existing attachment.
    let attachmentId = null;
    if (attachment) {
      attachmentId = (await createAttachment(attachment, transaction)).id;
    } else if (attachment_uuid) {
      const existing = await attachmentRepository.findOne({
        uuid: attachment_uuid,
      });
      attachmentId = existing?.id ?? null;
    }

    message = await queryMessageRepository.createMessage(
      {
        query_id: query.id,
        sender_id: currentUser.id,
        message_type,
        content,
        attachment_id: attachmentId,
      },
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }

  return publishMessageCreated(payload, query, message.uuid);
};

/**
 * Edits the text of the sender's own message. The attachment never changes, and a
 * message that is only an attachment (image, video, file without typed text) can't be edited.
 */
exports.updateQueryMessage = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const { query, message } = await findMessageInAccessibleQuery(payload);
  payload = validateQueryBodyParameters({
    payload,
    route: QueryRoute.UPDATE_QUERY_MESSAGE,
  });

  assertCanModifyMessage(message, currentUser, "edit");
  if (isAttachmentOnlyMessage(message)) {
    throw new ForbiddenError(
      "Attachments without text cannot be edited.",
      "Only messages with text can be edited.",
    );
  }

  await queryMessageRepository.updateMessageById(message.id, {
    content: payload.body.content,
  });

  const updatedMessage = await loadMessage(message.uuid);
  await publishQueryEvent(payload, query, QueryEvent.ENUM.MESSAGE_UPDATED, {
    message: updatedMessage,
  });

  return updatedMessage;
};

exports.deleteQueryMessage = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const { query, message } = await findMessageInAccessibleQuery(payload);

  assertCanModifyMessage(message, currentUser, "delete");

  await queryMessageRepository.deleteMessageById(message.id);

  await publishQueryEvent(payload, query, QueryEvent.ENUM.MESSAGE_DELETED, {
    message_uuid: message.uuid,
  });
};

/* -------------------------------------------------------------------------- */
/*                                 Attachments                                */
/* -------------------------------------------------------------------------- */

exports.addAttachment = async (payload) => {
  const query = await findAccessibleQuery(payload);
  payload = validateQueryBodyParameters({
    payload,
    route: QueryRoute.ADD_QUERY_ATTACHMENT,
  });
  const { attachment, message_uuid } = payload.body;

  const transaction = await transactionRepository.startTransaction();
  try {
    const createdAttachment = await createAttachment(attachment, transaction);

    if (message_uuid) {
      const message = await queryMessageRepository.getMessageByUUID(
        message_uuid,
        transaction,
      );
      if (!message || message.query_id !== query.id) {
        throw new NotFoundError(
          "Query message not found.",
          "Message with provided uuid not found in this query.",
        );
      }

      await queryMessageRepository.updateMessageById(
        message.id,
        { attachment_id: createdAttachment.id },
        transaction,
      );
    }

    await transactionRepository.commitTransaction(transaction);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.removeAttachment = async (payload) => {
  const { message } = await findMessageInAccessibleQuery(payload);

  if (!message.attachment_id) {
    throw new BadRequestError("Message does not have an attachment.");
  }

  return queryMessageRepository.updateMessageById(message.id, {
    attachment_id: null,
  });
};

/* -------------------------------------------------------------------------- */
/*                                   Members                                  */
/* -------------------------------------------------------------------------- */

exports.getQueryMembers = async (payload) => {
  const query = await findAccessibleQuery(payload);
  return queryMemberRepository.getMembersByQueryId(query.id);
};

/**
 * Adds one or more users to the query. You can't add yourself, and users who are
 * already members (in any role) are skipped. Returns the updated member list.
 */
exports.addMember = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const query = await findAccessibleQuery(payload);
  payload = validateQueryBodyParameters({
    payload,
    route: QueryRoute.ADD_QUERY_MEMBERS,
  });
  const { user_uuids, role } = payload.body;

  if (user_uuids.includes(currentUser.user_id)) {
    throw new BadRequestError("You can't add yourself to the query.");
  }

  const users = await findUsersByUUIDs(user_uuids);
  const memberUserIds = new Set(
    (query.members ?? []).map((member) => member.user_id),
  );
  const usersToAdd = users.filter((user) => !memberUserIds.has(user.id));
  if (!usersToAdd.length) {
    throw new ConflictError(
      "Selected users are already members of this query.",
    );
  }

  const transaction = await transactionRepository.startTransaction();
  let systemMessage;
  try {
    await queryMemberRepository.createMembers(
      {
        query_id: query.id,
        user_ids: usersToAdd.map((user) => user.id),
        role,
        assigned_by: currentUser.id,
      },
      transaction,
    );

    const names = usersToAdd.map((user) => user.name).join(", ");
    systemMessage = await createSystemMessage(
      query,
      currentUser,
      `${names} ${usersToAdd.length === 1 ? "was" : "were"} added by ${currentUser.name}.`,
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }

  await publishMessageCreated(payload, query, systemMessage.uuid);
  return publishMembersChanged(payload, query);
};

/** Removes another member from the query (you can't remove yourself). Returns the updated member list. */
exports.removeMember = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const query = await findAccessibleQuery(payload);
  const { member_uuid } = payload.params;

  // The URL may carry the member's uuid or the member user's uuid.
  let member = await queryMemberRepository.findMemberInQuery(query.id, {
    memberUUID: member_uuid,
  });
  if (!member) {
    const user = await userRepository.findOne({ user_id: member_uuid });
    if (user) {
      member = await queryMemberRepository.findMemberInQuery(query.id, {
        userId: user.id,
      });
    }
  }
  if (!member) {
    throw new NotFoundError(
      "Member not found.",
      "Member with provided uuid not found in this query.",
    );
  }
  if (member.user_id === currentUser.id) {
    throw new ForbiddenError("You can't remove yourself from the query.");
  }

  const removedUser = await userRepository.findOne({ id: member.user_id });

  const transaction = await transactionRepository.startTransaction();
  let systemMessage;
  try {
    await queryMemberRepository.deleteMemberById(member.id, transaction);
    systemMessage = await createSystemMessage(
      query,
      currentUser,
      `${removedUser?.name ?? "A member"} was removed by ${currentUser.name}.`,
      transaction,
    );

    await transactionRepository.commitTransaction(transaction);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }

  await publishMessageCreated(payload, query, systemMessage.uuid);
  return publishMembersChanged(payload, query);
};

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const toPlain = (record) => record?.toJSON?.() ?? record ?? null;

/** The signed-in user, loaded once per request (cached on the request object). */
async function getCurrentUser(payload) {
  if (payload.queryCurrentUser) return payload.queryCurrentUser;

  const user_uuid = payload.user?.user_id || payload.decoded?.user?.user_id;
  if (!user_uuid) {
    throw new UnauthorizedError("User is not authenticated.");
  }

  const user = await userRepository.findOne({ user_id: user_uuid });
  if (!user) {
    throw new UnauthorizedError("Authenticated user not found.");
  }

  payload.queryCurrentUser = user;
  return user;
}

/** Users by uuid (`user.user_id`); fails when any of them doesn't exist. */
async function findUsersByUUIDs(userUUIDs) {
  const users = [];
  for (const userUUID of userUUIDs) {
    const user = await userRepository.findOne({ user_id: userUUID });
    if (!user) {
      throw new NotFoundError(
        "User not found.",
        `User with uuid ${userUUID} not found.`,
      );
    }
    users.push(user);
  }
  return users;
}

/** Only the creator and the query's members can see or act on a query. */
function canAccessQuery(query, user) {
  return (
    query.creator_id === user.id ||
    (query.members ?? []).some((member) => member.user_id === user.id)
  );
}
async function findAccessibleQuery(payload) {
  const currentUser = await getCurrentUser(payload);
  const query = await queryRepository.getQueryByUUID(payload.params.query_uuid);

  if (!query) {
    throw new NotFoundError(
      "Query not found.",
      "Query with provided uuid not found.",
    );
  }
  if (!canAccessQuery(query, currentUser)) {
    throw new ForbiddenError("You don't have access to this query.");
  }
  return query;
}

/** Loads the query and a message, making sure the message belongs to that query. */
async function findMessageInAccessibleQuery(payload) {
  const query = await findAccessibleQuery(payload);
  const message = await queryMessageRepository.getMessageByUUID(
    payload.params.message_uuid,
  );

  if (!message || message.query_id !== query.id) {
    throw new NotFoundError(
      "Message not found.",
      "Message with provided uuid not found in this query.",
    );
  }
  return { query, message };
}

function assertCanModifyMessage(message, user, action) {
  if (message.sender_id !== user.id) {
    throw new ForbiddenError(`You can only ${action} your own messages.`);
  }
  if (message.message_type === QueryMessageType.ENUM.SYSTEM) {
    throw new ForbiddenError(`System messages cannot be ${action}d.`);
  }
}

/**
 * A file sent without text is stored with this placeholder as its content
 * (keep in sync with `attachmentOnlyContent` in the frontend).
 */
const attachmentOnlyContent = (fileName) => `Sent an attachment: ${fileName}`;

function isAttachmentOnlyMessage(message) {
  return Boolean(
    message.attachment_id &&
    (!message.content?.trim() ||
      message.content === attachmentOnlyContent(message.attachment?.file_name)),
  );
}

function createAttachment(fileData, transaction) {
  return attachmentRepository.create(
    {
      file_name: fileData.originalname || fileData.file_name,
      file_url: fileData.file_url || fileData.location || "",
      meta_data: fileData.meta_data || null,
    },
    { transaction },
  );
}

function createSystemMessage(query, sender, content, transaction) {
  return queryMessageRepository.createMessage(
    {
      query_id: query.id,
      sender_id: sender.id,
      message_type: QueryMessageType.ENUM.SYSTEM,
      content,
    },
    transaction,
  );
}

/** Re-reads a message with its sender and attachment, as plain JSON for responses/events. */
async function loadMessage(messageUUID) {
  return toPlain(await queryMessageRepository.getMessageByUUID(messageUUID));
}

/** Sends a new (or system) message to everyone in the query's chat. */
async function publishMessageCreated(payload, query, messageUUID) {
  const message = await loadMessage(messageUUID);
  await publishQueryEvent(payload, query, QueryEvent.ENUM.MESSAGE_CREATED, {
    message,
  });
  return message;
}

/** Sends the query's current member list to everyone with the chat open. */
async function publishMembersChanged(payload, query) {
  const members = (
    await queryMemberRepository.getMembersByQueryId(query.id)
  ).map(toPlain);
  await publishQueryEvent(payload, query, QueryEvent.ENUM.MEMBERS_CHANGED, {
    members,
  });
  return members;
}
