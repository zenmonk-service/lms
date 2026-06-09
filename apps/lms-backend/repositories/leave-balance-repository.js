const { Op } = require("sequelize");
const { getSchema } = require("../lib/schema");
const db = require("../models");
const { BaseRepository } = require("./base-repository");
const { BadRequestError } = require("../middleware/error");
class LeaveBalanceRepository extends BaseRepository {
  constructor({ sequelize }) {
    super({
      sequelize,
      modelFactory: () => db.tenants.leave_balance.schema(getSchema()),
    });
  }

  async getLeaveBalancesOfUser(user_uuid, leave_type_id, period) {
    if (!user_uuid) {
      throw new BadRequestError("User uuid is required to fetch leave balance");
    }
    const criteria = {
      user_id: { [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id") },
      period,
      leave_type_id,
    };
    const include = [
      {
        association: this.model.leave_type,
        model: db.tenants.leave_type.schema(getSchema()),
      },
    ];
    return this.findOne(criteria, include);
  }

  async getLeaveBalanceByUUIDS(user_uuid, leave_type_uuid, transaction) {
    const criteria = {
      user_id: { [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id") },
      leave_type_id: {
        [Op.eq]: this.getLiteralFrom("leave_type", leave_type_uuid),
      },
    };
    const include = [
      {
        association: this.model.leave_type,
      },
    ];
    return this.findOne(criteria, include, undefined, {}, transaction);
  }

  async createLeaveBalance(payload, transaction) {
    console.log("payload: ", payload);
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

  async updateLeaveBalanceByUUIDS(
    { user_uuid, leave_type_uuid },
    payload,
    transaction,
  ) {
    const criteria = {};

    if (user_uuid)
      criteria.user_id = {
        [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id"),
      };
    if (leave_type_uuid)
      criteria.leave_type_id = {
        [Op.eq]: this.getLiteralFrom("leave_type", leave_type_uuid),
      };

    return this.update(criteria, payload, { transaction });
  }

  async bulkCreateLeaveBalances(payload, transaction) {
    console.log("payload: ", payload);
    return this.bulkCreate(payload, {
      transaction,
      conflictAttributes: ["user_id", "leave_type_id", "period"],
      updateOnDuplicate: ["leaves_allocated", "balance", "updated_at", "final_balance"],
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
          model: db.tenants.leave_type.schema(getSchema()),
        },
      ],
      true,
      null,
      null,
      { order: [["balance", "DESC"]] },
    );
  }

  async getAllLeaveBalancesOfUser(user_uuid, period) {
    if (!user_uuid) {
      throw new BadRequestError("User uuid is required to fetch leave balance");
    }
    const criteria = {
      user_id: { [Op.eq]: this.getLiteralFrom("user", user_uuid, "user_id") },
      period,
    };
    const include = [
      {
        association: this.model.leave_type,
        model: db.tenants.leave_type.schema(getSchema()),
      },
    ];
    return this.findAll(criteria, include);
  }

  async sumLeaveBalancesFromPeriod(user_uuid, leave_type_id, period, transaction) {
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
