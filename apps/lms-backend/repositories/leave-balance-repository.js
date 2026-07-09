const { Op } = require("sequelize");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { BadRequestError } = require("../middleware/error");
class LeaveBalanceRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_balance,
    });
  }

  async listLeaveBalance({ user_uuid, period }) {
    const criteria = {};

    if (user_uuid) {
      criteria.user_id = {
        [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id"),
      };
    }

    if (period) {
      criteria.period = period;
    }

    const include = [
      {
        association: this.model.leave_type,
        model: this.tenant(db.tenants.leave_type),
      },
    ];

    return this.findAll(criteria, include);
  }

  async getLeaveBalanceByUUIDS({
    user_uuid,
    leave_type_uuid,
    period,
    transaction = undefined,
  }) {
    const criteria = {};
    if (user_uuid) {
      criteria.user_id = {
        [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id"),
      };
    }

    if (leave_type_uuid) {
      criteria.leave_type_id = {
        [Op.eq]: this.getLiteralFrom("leave_type", leave_type_uuid),
      };
    }
    if (period) {
      criteria.period = period;
    }
    const include = [
      {
        association: this.model.leave_type,
        model: this.tenant(db.tenants.leave_type),
      },
    ];
    return this.findOne(criteria, include, undefined, {}, transaction);
  }

  async createLeaveBalance(payload, transaction) {
    if (payload.user_uuid) {
      payload.user_id = this.getLiteralFrom(
        "user",
        payload.user_uuid,
        "user_id",
      );
      delete payload.user_uuid;
    }
    return this.create(payload, { transaction });
  }

  async bulkCreateLeaveBalances(payload, transaction) {
    return this.bulkCreate(payload, {
      transaction,
      conflictAttributes: ["user_id", "leave_type_id", "period"],
      updateOnDuplicate: [
        "leaves_allocated",
        "balance",
        "updated_at",
        "final_balance",
      ],
    });
  }

  async listLeaveBalancesByPeriod(period, leave_type_ids) {
    const normalizedLeaveTypeIds = Array.isArray(leave_type_ids)
      ? leave_type_ids
      : leave_type_ids?.[Op.in] || [];

    return this.findAll(
      {
        period,
        leave_type_id: { [Op.in]: normalizedLeaveTypeIds },
      },
      [
        {
          association: this.model.leave_type,
          model: this.tenant(db.tenants.leave_type),
        },
      ],
      true,
      null,
      null,
      { order: [["balance", "DESC"]] },
    );
  }

  async sumLeaveBalancesFromPeriod(
    user_uuid,
    leave_type_id,
    period,
    transaction,
  ) {
    if (!user_uuid) {
      throw new BadRequestError("User uuid is required to fetch leave balance");
    }

    const criteria = {
      user_id: { [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id") },
      leave_type_id: { [Op.eq]: leave_type_id },
      period: { [Op.gte]: period },
    };

    return this.sum(criteria, "balance", [], true, transaction);
  }
}

module.exports = {
  leaveBalanceRepository: new LeaveBalanceRepository({
    sequelize: db.sequelize,
  }),
};
