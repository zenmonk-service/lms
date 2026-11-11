const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");

class QueryRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.queries,
    });
  }

  async tableExists(tableName) {
    const schema = this.schema || "public";
    const result = await this.sequelize.query(
      "SELECT to_regclass($1) AS table_name;",
      {
        bind: [`"${schema}"."${tableName}"`],
      },
    );

    const row = Array.isArray(result) ? result[0] : result?.[0];
    const rows = Array.isArray(row) ? row : [row];
    return rows.some((entry) => entry && entry.table_name === `"${schema}"."${tableName}"`);
  }

  async generateUniqueTicketNumber() {
    const latestQuery = await this.model.findOne({
      order: [["created_at", "DESC"]],
      attributes: ["ticket_number"],
      paranoid: false,
    });

    let nextNum = 1001;
    if (latestQuery && latestQuery.ticket_number) {
      const match = latestQuery.ticket_number.match(/TICK-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    let ticketNumber = `TICK-${nextNum}`;
    while (
      await this.model.findOne({
        where: { ticket_number: ticketNumber },
        paranoid: false,
      })
    ) {
      nextNum += 1;
      ticketNumber = `TICK-${nextNum}`;
    }

    return ticketNumber;
  }

  async getFilteredQueries(
    { status, priority, module: queryModule, search, creator_id, assigned_team, user_id },
    { page: pageOption = 1, limit: limitOption = 10, archive = false } = {},
  ) {
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    const criteria = {};
    const paranoid = !archive;
    const hasQueryMessagesTable = await this.tableExists("query_messages");

    if (status && status !== "ALL") criteria.status = { [Op.eq]: status };
    if (priority && priority !== "ALL") criteria.priority = { [Op.eq]: priority };
    if (queryModule && queryModule !== "ALL") criteria.module = { [Op.eq]: queryModule };
    if (assigned_team) criteria.assigned_team = { [Op.eq]: assigned_team };
    if (creator_id) criteria.creator_id = { [Op.eq]: creator_id };

    if (search) {
      criteria[Op.or] = [
        { ticket_number: { [Op.iLike]: `%${search}%` } },
        { subject: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const include = [
      {
        model: this.tenant(db.tenants.user),
        as: "creator",
        attributes: ["id", "user_id", "name", "email", "image"],
      },
      {
        model: this.tenant(db.tenants.query_members),
        as: "members",
        required: !!user_id,
        where: user_id ? { user_id } : undefined,
        include: [
          {
            model: this.tenant(db.tenants.user),
            as: "user",
            attributes: ["id", "user_id", "name", "email", "image"],
          },
        ],
      },
    ];

    if (hasQueryMessagesTable) {
      include.push({
        model: this.tenant(db.tenants.query_messages),
        as: "messages",
        limit: 1,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: this.tenant(db.tenants.user),
            as: "sender",
            attributes: ["id", "user_id", "name", "email", "image"],
          },
          {
            model: this.tenant(db.tenants.attachment),
            as: "attachment",
            attributes: ["id", "uuid", "file_name", "file_url", "meta_data"],
          },
        ],
      });
    }

    const { rows, count } = await this.model.findAndCountAll({
      where: criteria,
      include,
      offset,
      limit,
      order: [["created_at", "DESC"]],
      paranoid,
      distinct: true,
    });

    return {
      rows,
      total: count,
      page: page + 1,
      limit,
    };
  }

  async getQueryByUUID(query_uuid, { paranoid = true } = {}) {
    const include = [
      {
        model: this.tenant(db.tenants.user),
        as: "creator",
        attributes: ["id", "user_id", "name", "email", "image"],
      },
      {
        model: this.tenant(db.tenants.query_members),
        as: "members",
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
      },
    ];

    if (await this.tableExists("query_messages")) {
      include.push({
        model: this.tenant(db.tenants.query_messages),
        as: "messages",
        include: [
          {
            model: this.tenant(db.tenants.user),
            as: "sender",
            attributes: ["id", "user_id", "name", "email", "image"],
          },
          {
            model: this.tenant(db.tenants.attachment),
            as: "attachment",
            attributes: ["id", "uuid", "file_name", "file_url", "meta_data"],
          },
        ],
        order: [["created_at", "ASC"]],
      });
    }

    return await this.model.findOne({
      where: { uuid: query_uuid },
      paranoid,
      include,
    });
  }

  async getQueryById(query_uuid, options) {
    return this.getQueryByUUID(query_uuid, options);
  }

  async getQueryByTicketNumber(ticket_number, { paranoid = true } = {}) {
    const include = [
      {
        model: this.tenant(db.tenants.user),
        as: "creator",
        attributes: ["id", "user_id", "name", "email", "image"],
      },
      {
        model: this.tenant(db.tenants.query_members),
        as: "members",
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
      },
    ];

    if (await this.tableExists("query_messages")) {
      include.push({
        model: this.tenant(db.tenants.query_messages),
        as: "messages",
        include: [
          {
            model: this.tenant(db.tenants.user),
            as: "sender",
            attributes: ["id", "user_id", "name", "email", "image"],
          },
          {
            model: this.tenant(db.tenants.attachment),
            as: "attachment",
            attributes: ["id", "uuid", "file_name", "file_url", "meta_data"],
          },
        ],
        order: [["created_at", "ASC"]],
      });
    }

    return await this.model.findOne({
      where: { ticket_number },
      paranoid,
      include,
    });
  }
}

module.exports = {
  queryRepository: new QueryRepository({
    sequelize: db.sequelize,
  }),
};
