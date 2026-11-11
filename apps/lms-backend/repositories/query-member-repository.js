const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");

class QueryMemberRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.query_members,
    });
  }

  async getMembersByQueryId(query_id) {
    return await this.model.findAll({
      where: { query_id },
      include: [
        {
          model: this.tenant(db.tenants.user),
          as: "user",
          attributes: ["id", "user_id", "name", "email", "image"],
        },
        {
          model: this.tenant(db.tenants.user),
          as: "assigner",
          attributes: ["id", "user_id", "name", "email", "image"],
        },
      ],
      order: [["assigned_at", "ASC"]],
    });
  }

  async getMemberById(identifier) {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        identifier,
      );
    const isNumericId =
      typeof identifier === "number" ||
      (!isNaN(Number(identifier)) && Number.isInteger(Number(identifier)));

    const where = isUUID
      ? { uuid: identifier }
      : isNumericId
      ? { id: Number(identifier) }
      : { uuid: identifier };

    return await this.model.findOne({
      where,
      include: [
        {
          model: this.tenant(db.tenants.user),
          as: "user",
          attributes: ["id", "user_id", "name", "email", "image"],
        },
        {
          model: this.tenant(db.tenants.user),
          as: "assigner",
          attributes: ["id", "user_id", "name", "email", "image"],
        },
      ],
    });
  }

  async findMember(query_id, user_id) {
    return await this.model.findOne({
      where: { query_id, user_id },
    });
  }
}

module.exports = {
  queryMemberRepository: new QueryMemberRepository({
    sequelize: db.sequelize,
  }),
};
