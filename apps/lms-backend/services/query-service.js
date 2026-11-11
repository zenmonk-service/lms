const {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  UnauthorizedError,
  ConflictError,
} = require("../middleware/error");
const {
  QueryPriority,
  QueryStatus,
  QueryModule,
  QueryMessageType,
  QueryMemberRole,
} = require("@repo/common");
const { queryRepository } = require("../repositories/query-repository");
const {
  queryMessageRepository,
} = require("../repositories/query-message-repository");
const { RedisManager } = require("../http/redis/redis-manager");
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

async function getCurrentUser(payload) {
  const user_uuid =
    payload.user?.user_id || payload.decoded?.user?.user_id;

  if (!user_uuid) {
    throw new UnauthorizedError("User is not authenticated.");
  }

  const user = await userRepository.findOne({ user_id: user_uuid });
  if (!user) {
    throw new UnauthorizedError("Authenticated user not found.");
  }

  return user;
}

exports.createQuery = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const {
    subject,
    description,
    module: queryModule,
    priority = QueryPriority.ENUM.MEDIUM,
    assigned_team = null,
    sla_due_at = null,
    ticket_number: customTicketNumber,
    initial_message,
    attachment,
    assignee_id,
    assignee_ids,
    assignee_uuids,
  } = payload.body;

  if (!subject) throw new BadRequestError("Subject is required.");
  if (!description) throw new BadRequestError("Description is required.");
  if (!queryModule) throw new BadRequestError("Module is required.");

  if (!QueryModule.isValidValue(queryModule)) {
    throw new BadRequestError(
      `Invalid module. Allowed values: ${QueryModule.getValues().join(", ")}`,
    );
  }

  if (priority && !QueryPriority.isValidValue(priority)) {
    throw new BadRequestError(
      `Invalid priority. Allowed values: ${QueryPriority.getValues().join(", ")}`,
    );
  }

  const rawAssigneeValues = [
    assignee_id,
    assignee_ids,
    assignee_uuids,
  ].flatMap((candidate) => {
    if (candidate === undefined || candidate === null || candidate === "") {
      return [];
    }

    if (Array.isArray(candidate)) {
      return candidate;
    }

    if (typeof candidate === "string" && candidate.includes(",")) {
      return candidate.split(",").map((entry) => entry.trim());
    }

    return [candidate];
  });

  const uniqueAssigneeValues = [...new Set(rawAssigneeValues.map((value) => String(value).trim()).filter(Boolean))];

  const ticketNumber =
    customTicketNumber ||
    (await queryRepository.generateUniqueTicketNumber());

  const transaction = await transactionRepository.startTransaction();

  try {
    const query = await queryRepository.create(
      {
        ticket_number: ticketNumber,
        creator_id: currentUser.id,
        module: queryModule,
        subject,
        description,
        priority,
        status: QueryStatus.ENUM.OPEN,
        assigned_team,
        sla_due_at,
      },
      { transaction },
    );

    await queryMemberRepository.create(
      {
        query_id: query.id,
        user_id: currentUser.id,
        role: QueryMemberRole.ENUM.PRIMARY_ASSIGNEE,
        assigned_by: currentUser.id,
        assigned_at: new Date(),
      },
      { transaction },
    );

    for (const assigneeValue of uniqueAssigneeValues) {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          assigneeValue,
        );

      const assigneeUser = await userRepository.findOne(
        isUUID ? { user_id: assigneeValue } : { id: Number(assigneeValue) },
      );

      if (!assigneeUser) {
        throw new NotFoundError(`User not found for assignee: ${assigneeValue}`);
      }

      if (assigneeUser.id === currentUser.id) {
        continue;
      }

      const existingMember = await queryMemberRepository.findOne({
        query_id: query.id,
        user_id: assigneeUser.id,
        role: QueryMemberRole.ENUM.ASSIGNEE,
      });

      if (existingMember) {
        continue;
      }

      await queryMemberRepository.create(
        {
          query_id: query.id,
          user_id: assigneeUser.id,
          role: QueryMemberRole.ENUM.ASSIGNEE,
          assigned_by: currentUser.id,
          assigned_at: new Date(),
        },
        { transaction },
      );
    }

    let createdAttachment = null;
    const attachmentData = attachment || payload.file;
    if (attachmentData) {
      createdAttachment = await attachmentRepository.create(
        {
          file_name: attachmentData.originalname || attachmentData.file_name,
          file_url: attachmentData.file_url || attachmentData.location || "",
          meta_data: attachmentData.meta_data || null,
        },
        { transaction },
      );
    }

    const messageContent = initial_message || description;
    await queryMessageRepository.create(
      {
        query_id: query.id,
        sender_id: currentUser.id,
        message_type: QueryMessageType.ENUM.PUBLIC,
        content: messageContent,
        attachment_id: createdAttachment ? createdAttachment.id : null,
      },
      { transaction },
    );

    await transactionRepository.commitTransaction(transaction);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.getFilteredQueries = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const {
    status,
    priority,
    module: queryModule,
    search,
    assigned_team,
    page = 1,
    limit = 10,
    archive,
    only_my_queries,
  } = payload.query;

  const filter = {
    status,
    priority,
    module: queryModule,
    search,
    assigned_team,
  };

  if (only_my_queries === "true" || payload.headers.is_me === "true") {
    filter.creator_id = currentUser.id;
  }

  return await queryRepository.getFilteredQueries(filter, {
    page,
    limit,
    archive: archive === "true",
  });
};

exports.getQueryById = async (payload) => {
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const query = await queryRepository.getQueryById(query_identifier);

  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  return query;
};

exports.updateQuery = async (payload) => {
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const {
    subject,
    description,
    module: queryModule,
    priority,
    assigned_team,
    sla_due_at,
  } = payload.body;

  const query = await queryRepository.getQueryById(query_identifier);
  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  const updates = {};
  if (subject !== undefined) updates.subject = subject;
  if (description !== undefined) updates.description = description;
  if (assigned_team !== undefined) updates.assigned_team = assigned_team;
  if (sla_due_at !== undefined) updates.sla_due_at = sla_due_at;

  if (queryModule !== undefined) {
    if (!QueryModule.isValidValue(queryModule)) {
      throw new BadRequestError(
        `Invalid module. Allowed values: ${QueryModule.getValues().join(", ")}`,
      );
    }
    updates.module = queryModule;
  }

  if (priority !== undefined) {
    if (!QueryPriority.isValidValue(priority)) {
      throw new BadRequestError(
        `Invalid priority. Allowed values: ${QueryPriority.getValues().join(", ")}`,
      );
    }
    updates.priority = priority;
  }

  await queryRepository.update({ id: query.id }, updates);
};

exports.changeQueryStatus = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const { status, note } = payload.body;

  if (!status) {
    throw new BadRequestError("Status is required.");
  }

  if (!QueryStatus.isValidValue(status)) {
    throw new BadRequestError(
      `Invalid status. Allowed values: ${QueryStatus.getValues().join(", ")}`,
    );
  }

  const query = await queryRepository.getQueryById(query_identifier);

  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  const updates = {
    status,
    resolved_at: status === QueryStatus.ENUM.RESOLVED ? new Date() : null,
  };

  const transaction = await transactionRepository.startTransaction();

  try {
    await queryRepository.update({ id: query.id }, updates, [], transaction );

    const systemNote = note ? ` Note: ${note}` : "";
    await queryMessageRepository.create(
      {
        query_id: query.id,
        sender_id: currentUser.id,
        message_type: QueryMessageType.ENUM.SYSTEM,
        content: `Status changed from ${query.status} to ${status} by ${currentUser.name}.${systemNote}`,
      },
      { transaction },
    );

    await transactionRepository.commitTransaction(transaction);


  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.deleteQuery = async (payload) => {
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const query = await queryRepository.getQueryById(query_identifier);

  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  const transaction = await transactionRepository.startTransaction();

  try {
    await queryMessageRepository.destroy(
      { query_id: query.id },
      { transaction },
    );
    await queryMemberRepository.destroy(
      { query_id: query.id },
      { transaction },
    );
    await queryRepository.destroy({ id: query.id }, { transaction });

    await transactionRepository.commitTransaction(transaction);

    return { message: "Query deleted successfully." };
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.createQueryMessage = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const {
    content,
    message_type = QueryMessageType.ENUM.PUBLIC,
    attachment_id,
    attachment,
  } = payload.body;

  if (!content) {
    throw new BadRequestError("Message content is required.");
  }

  if (!QueryMessageType.isValidValue(message_type)) {
    throw new BadRequestError(
      `Invalid message type. Allowed values: ${QueryMessageType.getValues().join(", ")}`,
    );
  }

  const query = await queryRepository.getQueryById(query_identifier);
  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  const transaction = await transactionRepository.startTransaction();

  try {
    let linkedAttachmentId = null;

    if (attachment_id) {
      // Find attachment by uuid or integer id
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          attachment_id,
        );
      const att = await attachmentRepository.findOne(
        isUUID ? { uuid: attachment_id } : { id: attachment_id },
      );
      if (att) linkedAttachmentId = att.id;
    }

    const fileData = payload.file || attachment;
    if (fileData) {
      const createdAttachment = await attachmentRepository.create(
        {
          file_name: fileData.originalname || fileData.file_name,
          file_url: fileData.file_url || fileData.location || "",
          meta_data: fileData.meta_data || null,
        },
        { transaction },
      );
      linkedAttachmentId = createdAttachment.id;
    }

    const message = await queryMessageRepository.create(
      {
        query_id: query.id,
        sender_id: currentUser.id,
        message_type,
        content,
        attachment_id: linkedAttachmentId,
      },
      { transaction },
    );

    await transactionRepository.commitTransaction(transaction);

    try {
      const organizationUuid = payload.headers?.org_uuid || payload.headers?.organization_uuid || query.organization_uuid;
      const queryChannel = organizationUuid ? `query:${organizationUuid}:${query.uuid}` : `query:${query.uuid}`;
      const messageWithRelations = await queryMessageRepository.getMessageById(message.id);
      const messagePayload = messageWithRelations?.toJSON?.() ?? messageWithRelations ?? message;

      await RedisManager.getInstance().publishMessage(queryChannel, {
        send_to: "everyone",
        content: {
          type: "QUERY_MESSAGE",
          query_uuid: query.uuid,
          message: messagePayload,
        },
      });
    } catch (publishError) {
      console.error("Failed to publish query message event:", publishError);
    }
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.updateQueryMessage = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const message_identifier =
    payload.params.message_uuid || payload.params.message_id;
  const { content } = payload.body;

  if (!content) {
    throw new BadRequestError("Content is required to update message.");
  }

  const message = await queryMessageRepository.getMessageById(
    message_identifier,
  );
  if (!message) {
    throw new NotFoundError("Message not found.");
  }

  if (message.sender_id !== currentUser.id) {
    throw new ForbiddenError("You can only edit your own messages.");
  }

  await queryMessageRepository.update({ id: message.id }, { content });

  return await queryMessageRepository.getMessageById(message.id);
};

exports.deleteQueryMessage = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const message_identifier =
    payload.params.message_uuid || payload.params.message_id;

  const message = await queryMessageRepository.getMessageById(
    message_identifier,
  );
  if (!message) {
    throw new NotFoundError("Message not found.");
  }

  if (message.sender_id !== currentUser.id) {
    throw new ForbiddenError("You can only delete your own messages.");
  }

  await queryMessageRepository.destroy({ id: message.id });

  return { message: "Query message deleted successfully." };
};

exports.getQueryMessages = async (payload) => {
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const { page = 1, limit = 50, message_type } = payload.query;

  const query = await queryRepository.getQueryById(query_identifier);
  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  return await queryMessageRepository.getMessagesByQueryId(query.id, {
    page,
    limit,
    message_type,
  });
};

exports.addAttachment = async (payload) => {
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const { message_uuid, message_id, file_name, file_url, meta_data } =
    payload.body;

  const query = await queryRepository.getQueryById(query_identifier);
  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  const fileData = payload.file || { file_name, file_url, meta_data };
  if (!fileData || (!fileData.originalname && !fileData.file_name)) {
    throw new BadRequestError("File data or upload is required.");
  }

  const transaction = await transactionRepository.startTransaction();

  try {
    const attachment = await attachmentRepository.create(
      {
        file_name: fileData.originalname || fileData.file_name,
        file_url: fileData.file_url || fileData.location || "",
        meta_data: fileData.meta_data || null,
      },
      { transaction },
    );

    const messageIdentifier = message_uuid || message_id;
    if (messageIdentifier) {
      const message = await queryMessageRepository.getMessageById(
        messageIdentifier,
      );

      if (!message || message.query_id !== query.id) {
        throw new NotFoundError("Query message not found.");
      }

      await queryMessageRepository.update(
        { id: message.id },
        { attachment_id: attachment.id },
        { transaction },
      );
    }

    await transactionRepository.commitTransaction(transaction);

    return attachment;
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.removeAttachment = async (payload) => {
  const message_identifier =
    payload.params.message_uuid || payload.params.message_id;

  const message = await queryMessageRepository.getMessageById(
    message_identifier,
  );
  if (!message) {
    throw new NotFoundError("Message not found.");
  }

  if (!message.attachment_id) {
    throw new BadRequestError("Message does not have an attachment.");
  }

  await queryMessageRepository.update(
    { id: message.id },
    { attachment_id: null },
  );

  return { message: "Attachment removed from query message successfully." };
};

exports.addMember = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const {
    user_uuid,
    user_id: targetUserId,
    role = QueryMemberRole.ENUM.ASSIGNEE,
  } = payload.body;

  if (!QueryMemberRole.isValidValue(role)) {
    throw new BadRequestError(
      `Invalid member role. Allowed values: ${QueryMemberRole.getValues().join(", ")}`,
    );
  }

  const query = await queryRepository.getQueryById(query_identifier);
  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  let userToAdd;
  if (user_uuid) {
    userToAdd = await userRepository.findOne({ user_id: user_uuid });
  } else if (targetUserId) {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        targetUserId,
      );
    userToAdd = await userRepository.findOne(
      isUUID ? { user_id: targetUserId } : { id: targetUserId },
    );
  }

  if (!userToAdd) {
    throw new NotFoundError("User to assign not found.");
  }

  const existingMember = await queryMemberRepository.findOne({
    query_id: query.id,
    user_id: userToAdd.id,
    role,
  });

  if (existingMember) {
    throw new ConflictError("User is already assigned with this role.");
  }

  const transaction = await transactionRepository.startTransaction();

  try {
    const member = await queryMemberRepository.create(
      {
        query_id: query.id,
        user_id: userToAdd.id,
        role,
        assigned_by: currentUser.id,
        assigned_at: new Date(),
      },
      { transaction },
    );

    // Log a system message
    await queryMessageRepository.create(
      {
        query_id: query.id,
        sender_id: currentUser.id,
        message_type: QueryMessageType.ENUM.SYSTEM,
        content: `${userToAdd.name} was added as ${role} by ${currentUser.name}.`,
      },
      { transaction },
    );

    await transactionRepository.commitTransaction(transaction);

    return await queryMemberRepository.getMemberById(member.id);
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.removeMember = async (payload) => {
  const currentUser = await getCurrentUser(payload);
  const query_identifier = payload.params.query_uuid || payload.params.query_id;
  const member_identifier =
    payload.params.member_uuid || payload.params.member_id;

  const query = await queryRepository.getQueryById(query_identifier);
  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  const isUUID =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      member_identifier,
    );

  let member = null;
  if (isUUID) {
    // Check if it's member uuid
    member = await queryMemberRepository.findOne({
      uuid: member_identifier,
      query_id: query.id,
    });

    // If not found, check if it's user_id uuid
    if (!member) {
      const user = await userRepository.findOne({ user_id: member_identifier });
      if (user) {
        member = await queryMemberRepository.findOne({
          user_id: user.id,
          query_id: query.id,
        });
      }
    }
  } else {
    member = await queryMemberRepository.findOne({
      id: parseInt(member_identifier, 10),
      query_id: query.id,
    });
  }

  if (!member) {
    throw new NotFoundError("Member not found in this query.");
  }

  const transaction = await transactionRepository.startTransaction();

  try {
    await queryMemberRepository.destroy({ id: member.id }, { transaction });

    await queryMessageRepository.create(
      {
        query_id: query.id,
        sender_id: currentUser.id,
        message_type: QueryMessageType.ENUM.SYSTEM,
        content: `A member was removed from this query by ${currentUser.name}.`,
      },
      { transaction },
    );

    await transactionRepository.commitTransaction(transaction);

    return { message: "Member removed from query successfully." };
  } catch (err) {
    await transactionRepository.rollbackTransaction(transaction);
    throw err;
  }
};

exports.getQueryMembers = async (payload) => {
  const query_identifier = payload.params.query_uuid || payload.params.query_id;

  const query = await queryRepository.getQueryById(query_identifier);
  if (!query) {
    throw new NotFoundError("Query not found.");
  }

  return await queryMemberRepository.getMembersByQueryId(query.id);
};
