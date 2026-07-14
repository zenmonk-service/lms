const { Op, where } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
const moment = require("moment");

class LeaveRequestRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_request,
    });
  }

  async getFilteredLeaveRequests(
    {
      user_uuid,
      leave_type_uuid,
      manager_uuid,
      managers,
      date,
      date_range,
      status,
      search,
      user_name_search,
    },
    { archive, page: pageOption, limit: limitOption },
  ) {
    let criteria = {};
    let managerCriteria = {};
    let leaveTypeCriteria = {};
    let userCriteria = {};
    let paranoid = true;
    const { offset, limit, page } = new Paginator(pageOption, limitOption);

    if (status) criteria.status = { [Op.eq]: status };
    if (date) criteria.start_date = { [Op.eq]: date };
    if (date_range)
      criteria.start_date = {
        [Op.between]: [date_range.start_date, date_range.end_date],
      };
    if (search) criteria.reason = { [Op.iLike]: `%${search}%` };
    if (leave_type_uuid) leaveTypeCriteria.uuid = { [Op.eq]: leave_type_uuid };
    if (user_uuid) userCriteria.user_id = { [Op.eq]: user_uuid };
    if (user_name_search)
      userCriteria.name = { [Op.iLike]: `%${user_name_search}%` };
    if (archive) paranoid = false;

    if (Array.isArray(managers) && managers.length > 0) {
      managerCriteria.user_id = { [Op.in]: managers };
    } else if (manager_uuid) {
      managerCriteria.user_id = { [Op.eq]: manager_uuid };
    }

    const include = [];

    include.push({
      model: this.tenant(db.tenants.user),
      as: "user",
      include: [
        {
          model: this.tenant(db.tenants.role),
          as: "role",
          attributes: ["name", "uuid"],
        },
      ],
      required: true,
      where: userCriteria,
    });

    include.push({
      model: this.tenant(db.tenants.leave_type),
      as: "leave_type",
      attributes: ["name", "uuid"],
      ...(Object.keys(leaveTypeCriteria).length
        ? { where: leaveTypeCriteria }
        : {}),
    });

    include.push({
      model: this.tenant(db.tenants.leave_request_manager),
      as: "managers",
      include: [
        {
          model: this.tenant(db.tenants.user),
          as: "user",
          include: [
            {
              model: this.tenant(db.tenants.role),
              as: "role",
              attributes: ["name", "uuid"],
            },
          ],
          ...(Object.keys(managerCriteria).length
            ? { where: managerCriteria }
            : {}),
        },
      ],
    });

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
    response.total = await this.count(criteria, { paranoid });
    return response;
  }

  async getLeaveRequestByUUID(leaveRequestUUID, transaction) {
    const criteria = { uuid: { [Op.eq]: leaveRequestUUID } };

    const include = [
      {
        model: this.tenant(db.tenants.user),
        as: "user",
        include: [
          {
            model: this.tenant(db.tenants.role),
            as: "role",
            attributes: ["name", "uuid"],
          },
        ],
      },
      {
        model: this.tenant(db.tenants.leave_type),
        as: "leave_type",
        include: [
          {
            model: this.tenant(db.tenants.leave_balance),
            as: "leave_balances",
            where: {
              user_id: { [Op.eq]: this.sequelize.col("LeaveRequest.user_id") },
              leave_type_id: {
                [Op.eq]: this.sequelize.col("LeaveRequest.leave_type_id"),
              },
              period: {
                [Op.lte]: this.sequelize.literal(
                  `TO_CHAR("LeaveRequest"."end_date", 'YYYY-MM')`,
                ),
              },
            },
            required: true,
          },
        ],
      },
      {
        model: this.tenant(db.tenants.leave_request_manager),
        as: "managers",
        include: [
          {
            model: this.tenant(db.tenants.user),
            as: "user",
          },
        ],
      },
    ];

    const leaveRequest = await this.findOne(
      criteria,
      include,
      undefined,
      undefined,
      transaction,
    );

    if (!leaveRequest) return null;

    leaveRequest.leave_balance =
      leaveRequest?.leave_type?.leave_balances?.[0] || null;
    if (leaveRequest.leave_type) {
      delete leaveRequest.leave_type.leave_balances;
    }

    return leaveRequest;
  }

  async createLeaveRequest(payload) {
    const {
      user_uuid,
      leave_type_uuid,
      start_date,
      end_date,
      reason,
      type,
      managers,
      range,
      leave_duration,
    } = payload;

    const include = [
      {
        model: this.tenant(db.tenants.leave_request_manager),
        as: "managers",
      },
    ];
    const leaveRequest = {
      user_id: this.getLiteralFrom("user", user_uuid, "user_id"),
      leave_type_id: this.getLiteralFrom("leave_type", leave_type_uuid),
      start_date,
      end_date,
      reason,
      type,
      range,
      leave_duration,
      managers: managers.map((manager) => ({
        user_id: this.getLiteralFrom("user", manager, "user_id"),
      })),
    };

    return this.create(leaveRequest, { include });
  }

  async updateLeaveRequestById(leaveRequestId, payload, transaction) {
    const criteria = { uuid: { [Op.eq]: leaveRequestId } };
    const {
      user_uuid,
      leave_type_uuid,
      start_date,
      end_date,
      reason,
      type,
      managers,
      range,
    } = payload;

    const leaveRequest = {
      user_id: this.getLiteralFrom("user", user_uuid, "user_id"),
      leave_type_id: this.getLiteralFrom("leave_type", leave_type_uuid),
      start_date,
      end_date,
      reason,
      type,
      range,
      leave_duration: this.model.calculateLeaveDuration(payload),
    };
    await this.update(criteria, leaveRequest, [], transaction);
  }

  async listLeaveRequestReport({ month, leave_type_uuid }) {
    const leaveTypeCriteria = {};
    const startDate = `${month}-01`;

    const endDate = moment(startDate).endOf("month").format("YYYY-MM-DD");
    if (leave_type_uuid) {
      leaveTypeCriteria.uuid = leave_type_uuid;
    }

    return this.findAll(
      {
        start_date: {
          [Op.between]: [startDate, endDate],
        },
      },
      [
        {
          model: this.tenant(db.tenants.leave_type),
          association: this.model.leave_type,
          where: leaveTypeCriteria,
          required: true,
          attributes: [],
        },
      ],
      true,
      [
        "status",
        [
          this.sequelize.fn("COUNT", this.sequelize.col("LeaveRequest.id")),
          "count",
        ],
      ],
      undefined,
      {
        group: ["status"],
        raw: true,
      },
    );
  }
}

module.exports = {
  leaveRequestRepository: new LeaveRequestRepository({
    sequelize: db.sequelize,
  }),
};
