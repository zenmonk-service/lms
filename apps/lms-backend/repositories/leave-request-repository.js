const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { Paginator } = require("./common/pagination");
class LeaveRequestRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_request.schema(getSchema()),
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
    },
    { archive, page: pageOption, limit: limitOption }
  ) {
    let criteria = {};
    let managerCriteria = {};
    let leaveTypeCriteria = {};
    let userCriteria = {};
    let paranoid = true;
    const { offset, limit, page } = new Paginator(pageOption, limitOption);

    if (status) criteria.status = { [Op.eq]: status };
    if (date) criteria.start_date = { [Op.eq]: date };
    if (date_range) criteria.start_date = { [Op.between]: date_range };
    if (leave_type_uuid) leaveTypeCriteria.uuid = { [Op.eq]: leave_type_uuid };
    if (user_uuid) userCriteria.user_id = { [Op.eq]: user_uuid };
    if (archive) paranoid = false;

    if (Array.isArray(managers) && managers.length > 0) {
      managerCriteria.user_id = { [Op.in]: managers };
    } else if (manager_uuid) {
      managerCriteria.user_id = { [Op.eq]: manager_uuid };
    }

    const include = [];

    include.push({
      model: db.tenants.user.schema(getSchema()),
      as: "user",
      ...(Object.keys(userCriteria).length ? { where: userCriteria } : {}),
    });

    include.push({
      model: db.tenants.leave_type.schema(getSchema()),
      as: "leave_type",
      attributes: ["name", "uuid"],
      ...(Object.keys(leaveTypeCriteria).length
        ? { where: leaveTypeCriteria }
        : {}),
    });

    include.push({
      model: db.tenants.leave_request_manager.schema(getSchema()),
      as: "managers",
      include: [
        {
          model: db.tenants.user.schema(getSchema()),
          as: "user",
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
      [["updated_at", "DESC"]],
      paranoid
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
        model: db.tenants.leave_type.schema(getSchema()),
        as: "leave_type",
        include: [
          {
            model: db.tenants.leave_balance.schema(getSchema()),
            as: "leave_balances",
            where: {
              user_id: { [Op.eq]: this.sequelize.col("LeaveRequest.user_id") },
            },
            required: true,
          },
        ],
      },
      {
        model: db.tenants.leave_request_manager.schema(getSchema()),
        as: "managers",
        include: [
          {
            model: db.tenants.user.schema(getSchema()),
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
      transaction
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
        model: db.tenants.leave_request_manager.schema(getSchema()),
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
      range
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
    return this.update(criteria, leaveRequest, [], transaction);
  }
}

module.exports = {
  leaveRequestRepository: new LeaveRequestRepository({
    sequelize: db.sequelize,
  }),
};
