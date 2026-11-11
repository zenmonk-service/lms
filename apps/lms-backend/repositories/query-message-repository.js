const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");

class QueryMessageRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.query_messages,
    });
  }

  async getMessagesByQueryId(
    query_id,
    { page: pageOption = 1, limit: limitOption = 50, message_type } = {},
  ) {
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    const criteria = { query_id };

    if (message_type) {
      criteria.message_type = { [Op.eq]: message_type };
    }

    const { rows, count } = await this.model.findAndCountAll({
      where: criteria,
      offset,
      limit,
      order: [["created_at", "ASC"]],
      include: [
        {
          model: this.tenant(db.tenants.user),
          as: "sender",
          attributes: ["id", "user_id", "name", "email", "image"],
        },
        {
          model: this.tenant(db.tenants.attachment),
          as: "attachment",
          attributes: ["id", "uuid", "file_name", "file_url", "meta_data", "created_at"],
        },
      ],
    });

    return {
      rows,
      total: count,
      page: page + 1,
      limit,
    };
  }

  async getMessageByUUID(message_uuid) {
    if (!message_uuid) {
      return null;
    }

    return await this.model.findOne({
      where: { uuid: message_uuid },
      include: [
        {
          model: this.tenant(db.tenants.user),
          as: "sender",
          attributes: ["id", "user_id", "name", "email", "image"],
        },
        {
          model: this.tenant(db.tenants.attachment),
          as: "attachment",
          attributes: ["id", "uuid", "file_name", "file_url", "meta_data", "created_at"],
        },
      ],
    });
  }

  async getMessageById(message_identifier) {
    if (!message_identifier) {
      return null;
    }

    const isUUID =
      typeof message_identifier === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        message_identifier,
      );

    return await this.model.findOne({
      where: isUUID ? { uuid: message_identifier } : { id: Number(message_identifier) },
      include: [
        {
          model: this.tenant(db.tenants.user),
          as: "sender",
          attributes: ["id", "user_id", "name", "email", "image"],
        },
        {
          model: this.tenant(db.tenants.attachment),
          as: "attachment",
          attributes: ["id", "uuid", "file_name", "file_url", "meta_data", "created_at"],
        },
      ],
    });
  }
}

module.exports = {
  queryMessageRepository: new QueryMessageRepository({
    sequelize: db.sequelize,
  }),
};
