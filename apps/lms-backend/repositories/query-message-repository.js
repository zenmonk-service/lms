const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { messageIncludes } = require("./common/query-includes");

class QueryMessageRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.query_messages,
    });
    this.tenantModel = (model) => this.tenant(model);
  }

  /**
   * Newest-first cursor pagination for the chat. Returns up to `limit` messages older
   * than the `before` message (or the latest ones when `before` is empty), ordered
   * oldest -> newest. A cursor (instead of page numbers) keeps paging stable while
   * messages are created or deleted in realtime.
   */
  async getMessagesByQueryId(
    queryId,
    { limit: limitOption = 50, before, message_type } = {},
  ) {
    const limit = Math.min(Math.max(Number(limitOption) || 50, 1), 100);
    const criteria = { query_id: { [Op.eq]: queryId } };

    if (message_type) criteria.message_type = { [Op.eq]: message_type };

    if (before) {
      // The cursor message may have been deleted meanwhile, so include deleted rows.
      const cursor = await this.findOne(
        { uuid: { [Op.eq]: before }, query_id: { [Op.eq]: queryId } },
        [],
        false,
        ["id"],
      );
      if (cursor) criteria.id = { [Op.lt]: cursor.id };
    }

    // One extra row tells whether anything older exists.
    const rows = await this.findAll(
      criteria,
      messageIncludes(this.tenantModel),
      true,
      undefined,
      undefined,
      { limit: limit + 1, order: [["id", "DESC"]] },
    );

    return {
      rows: rows.slice(0, limit).reverse(),
      has_more: rows.length > limit,
      limit,
    };
  }

  async getMessageByUUID(messageUUID, transaction) {
    if (!messageUUID) return null;

    return this.findOne(
      { uuid: { [Op.eq]: messageUUID } },
      messageIncludes(this.tenantModel),
      undefined,
      undefined,
      transaction,
    );
  }

  async createMessage(payload, transaction) {
    const {
      query_id,
      sender_id,
      message_type,
      content,
      attachment_id = null,
    } = payload;

    return this.create(
      { query_id, sender_id, message_type, content, attachment_id },
      { transaction },
    );
  }

  async updateMessageById(messageId, payload, transaction) {
    return this.update(
      { id: { [Op.eq]: messageId } },
      payload,
      [],
      transaction,
    );
  }

  /** Soft delete of one message. */
  async deleteMessageById(messageId, transaction) {
    return this.destroy({ id: { [Op.eq]: messageId } }, false, [], transaction);
  }

  /** Permanent delete of every message of a query (used when the query is deleted). */
  async deleteMessagesByQueryId(queryId, transaction) {
    return this.destroy(
      { query_id: { [Op.eq]: queryId } },
      true,
      [],
      transaction,
    );
  }
}

module.exports = {
  queryMessageRepository: new QueryMessageRepository({
    sequelize: db.sequelize,
  }),
};
