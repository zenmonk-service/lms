const { Op } = require("sequelize");
const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");
const moment = require("moment");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const {
  validatingQueryParameters,
} = require("../lib/validate-query-parameters");
const { NotFoundError } = require("../middleware/error");
const {
  AccrualPeriod,
} = require("../models/tenants/leave/enum/accrual-period-enum");
const {
  roleLeaveTypeRepository,
} = require("../repositories/role-leave-type-repository");
const {
  userLeaveTypeRepository,
} = require("../repositories/user-leave-type-repository");
const Period = require("../lib/period");

exports.getFilteredLeaveTypes = async (payload) => {
  payload = await validatingQueryParameters({
    ...payload,
    repository: leaveTypeRepository,
  });
  let {
    order = "ASC",
    order_column = "is_active",
    search,
    user_uuid,
  } = payload.query;

  return leaveTypeRepository.getFilteredLeaveTypes(
    { search, user_uuid },
    { order_type: order, order_column },
  );
};

exports.createLeaveType = async (payload) => {
  const { roles = [], users = [], ...leaveTypePayload } = payload.body;

  const transaction = await transactionRepository.startTransaction();

  try {
    const leaveType = await leaveTypeRepository.create(leaveTypePayload, {
      transaction,
    });

    if (roles.length) {
      await roleLeaveTypeRepository.bulkCreate(
        roles.map((roleUuid) => ({
          role_id: leaveTypeRepository.getLiteralFrom("role", roleUuid),
          leave_type_id: leaveType.id,
        })),
        { transaction },
      );
    }

    if (users.length) {
      await userLeaveTypeRepository.bulkCreate(
        users.map((userUuid) => ({
          user_id: leaveTypeRepository.getLiteralFrom(
            "user",
            userUuid,
            "user_id",
          ),
          leave_type_id: leaveType.id,
        })),
        { transaction },
      );
    }

    const userCriteria = {
      [Op.or]: [],
    };

    if (roles.length) {
      userCriteria[Op.or].push({
        role_id: {
          [Op.in]: roles.map((roleUuid) =>
            userRepository.getLiteralFrom("role", roleUuid),
          ),
        },
      });
    }

    if (users.length) {
      userCriteria[Op.or].push({
        user_id: {
          [Op.in]: users,
        },
      });
    }

    const userIds = await userRepository.findAll(
      userCriteria,
      [],
      undefined,
      ["id"],
      transaction,
    );

    const leaveBalances = await this.allocateLeaveBalance(userIds, leaveType);

    await leaveBalanceRepository.bulkCreate(leaveBalances, { transaction });

    await transactionRepository.commitTransaction(transaction);

    return leaveType;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.allocateLeaveBalance = async (users, leaveType) => {
  const today = new Date();
  if (leaveType.accrual.period == AccrualPeriod.ENUM.MONTHLY) {
    // generate 3 periods: current + next 2 months
    const periods = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() + i);

      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });

    return users.flatMap((user) => {
      const leaveCount = leaveType.getLeaveCount() ?? 0;

      return periods.map((period) => ({
        user_id: user.id,
        leave_type_id: leaveType.id,
        balance: leaveCount,
        leaves_allocated: leaveCount,
        period,
      }));
    });
  } else {
    const currentPeriod = Period.getCurrentPeriod();

    return users.map((user) => ({
      user_id: user.id,
      leave_type_id: leaveType.id,
      balance: leaveType.getLeaveCount() ?? 0,
      leaves_allocated: leaveType.getLeaveCount() ?? 0,
      period: currentPeriod,
    }));
  }
};

exports.getLeaveTypeById = async (payload) => {
  const { leave_type_uuid } = payload.params;
  return leaveTypeRepository.getLeaveTypeById(leave_type_uuid);
};

exports.updateLeaveTypeById = async (payload) => {
  const { leave_type_uuid } = payload.params;
  await leaveTypeRepository.update({ uuid: leave_type_uuid }, payload.body);
};

exports.activateLeaveType = async (payload) => {
  const { leave_type_uuid } = payload.params;

  const leaveType = await leaveTypeRepository.findOne({
    uuid: leave_type_uuid,
  });
  if (!leaveType) throw new NotFoundError("Leave Type not found");

  leaveType.activate();

  return leaveType.save();
};

exports.deactivateLeaveType = async (payload) => {
  const { leave_type_uuid } = payload.params;

  const leaveType = await leaveTypeRepository.findOne({
    uuid: leave_type_uuid,
  });
  if (!leaveType) throw new NotFoundError("Leave Type not found");

  leaveType.deactivate();

  return leaveType.save();
};

exports.getUserLeaveBalances = async (payload) => {
  const { user_uuid } = payload.params;
  const { period } = payload.query;

  if (!user_uuid) {
    throw new BadRequestError("User uuid is required to fetch leave balance");
  }

  return leaveBalanceRepository.listLeaveBalance({ user_uuid, period });
};
