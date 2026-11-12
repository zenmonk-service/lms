const { Op } = require("sequelize");
const moment = require("moment-timezone");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
const { userInclude, memberUserIncludes } = require("./common/query-includes");

class QueryRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.queries,
    });
    this.tenantModel = (model) => this.tenant(model);
  }

  /** Creator plus members (with who assigned them), as shown on the query detail. */
  detailIncludes() {
    return [
      userInclude(this.tenantModel, "creator"),
      {
        model: this.tenant(db.tenants.query_members),
        as: "members",
        include: memberUserIncludes(this.tenantModel),
      },
    ];
  }

  /**
   * Ticket number built from who raised it and when: <INITIALS>-<YYYYMMDD>-<HHmmss>,
   * e.g. "AKG-20261111-143205". A numeric suffix is added if the same user raises
   * two queries in the same second. Fits the VARCHAR(32) column.
   */
  async generateUniqueTicketNumber(user, date = new Date()) {
    const initials =
      (user?.name ?? "")
        .split(/\s+/)
        .map((word) => word.replace(/[^a-z]/gi, "").charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 4) ||
      (user?.email ?? "")
        .replace(/[^a-z]/gi, "")
        .slice(0, 3)
        .toUpperCase() ||
      "USR";

    const timezone = process.env.APP_TIMEZONE || "Asia/Kolkata";
    const base = `${initials}-${moment(date).tz(timezone).format("YYYYMMDD-HHmmss")}`;

    let ticketNumber = base;
    for (let suffix = 2; ; suffix += 1) {
      const exists = await this.findOne(
        { ticket_number: { [Op.eq]: ticketNumber } },
        [],
        false,
        ["id"],
      );
      if (!exists) return ticketNumber;
      ticketNumber = `${base}-${suffix}`;
    }
  }

  /**
   * Paginated list for the query inbox. `accessible_by` (numeric user id) limits it
   * to queries that user created or is a member of.
   */
  async getFilteredQueries(
    {
      status,
      priority,
      module: queryModule,
      search,
      creator_id,
      accessible_by,
    },
    { archive = false, page: pageOption, limit: limitOption } = {},
  ) {
    const { offset, limit, page } = new Paginator(pageOption, limitOption);
    const criteria = {};
    const conditions = [];
    const paranoid = !archive;

    if (status && status !== "ALL") criteria.status = { [Op.eq]: status };
    if (priority && priority !== "ALL") {
      criteria.priority = { [Op.eq]: priority };
    }
    if (queryModule && queryModule !== "ALL") {
      criteria.module = { [Op.eq]: queryModule };
    }
    if (creator_id) criteria.creator_id = { [Op.eq]: creator_id };

    if (search) {
      conditions.push({
        [Op.or]: [
          { ticket_number: { [Op.iLike]: `%${search}%` } },
          { subject: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      });
    }

    if (accessible_by) {
      const userId = Number(accessible_by);
      if (!Number.isInteger(userId)) {
        throw new Error("Invalid accessible_by user id.");
      }
      conditions.push({
        [Op.or]: [
          { creator_id: { [Op.eq]: userId } },
          {
            id: {
              [Op.in]: this.sequelize.literal(
                `(SELECT query_id FROM "${this.schema}"."query_members" WHERE user_id = ${userId} AND deleted_at IS NULL)`,
              ),
            },
          },
        ],
      });
    }
    if (conditions.length) criteria[Op.and] = conditions;

    const include = [
      userInclude(this.tenantModel, "creator"),
      {
        model: this.tenant(db.tenants.query_members),
        as: "members",
        include: [userInclude(this.tenantModel, "user")],
      },
    ];

    const response = await this.findAndCountAll(
      criteria,
      include,
      offset,
      limit,
      [["created_at", "DESC"]],
      paranoid,
    );

    response.current_page = page + 1;
    response.per_page = limit;
    response.total = response.count;
    return response;
  }

  async getQueryByUUID(queryUUID, transaction) {
    return this.findOne(
      { uuid: { [Op.eq]: queryUUID } },
      this.detailIncludes(),
      undefined,
      undefined,
      transaction,
    );
  }

  async getQueryByTicketNumber(ticketNumber, transaction) {
    return this.findOne(
      { ticket_number: { [Op.eq]: ticketNumber } },
      this.detailIncludes(),
      undefined,
      undefined,
      transaction,
    );
  }

  async createQuery(payload, transaction) {
    const {
      ticket_number,
      creator_id,
      module,
      subject,
      description,
      priority,
      status,
      sla_due_at,
    } = payload;

    return this.create(
      {
        ticket_number,
        creator_id,
        module,
        subject,
        description,
        priority,
        status,
        sla_due_at,
      },
      { transaction },
    );
  }

  async updateQueryById(queryId, payload, transaction) {
    return this.update({ id: { [Op.eq]: queryId } }, payload, [], transaction);
  }

  /** Permanent delete (the caller removes its messages and members in the same transaction). */
  async deleteQueryById(queryId, transaction) {
    return this.destroy({ id: { [Op.eq]: queryId } }, true, [], transaction);
  }
}

module.exports = {
  queryRepository: new QueryRepository({
    sequelize: db.sequelize,
  }),
};
