const { Op } = require("sequelize");
const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");
const Period = require("../lib/period");
const { BadRequestError } = require("../middleware/error");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const {
  leaveBalanceLogRepository,
} = require("../repositories/leave-balance-log-repository");
const {
  LeaveBalanceLogSource,
} = require("../models/tenants/leave/enum/leave-balance-log-source-enum");
const { payrollRepository } = require("../repositories/payroll-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  validatingQueryParameters,
} = require("../lib/validate-query-parameters");
const { NotFoundError } = require("../middleware/error");
const {
  roleLeaveTypeRepository,
} = require("../repositories/role-leave-type-repository");
const {
  userLeaveTypeRepository,
} = require("../repositories/user-leave-type-repository");
const { allocateLeaveBalance } = require("../lib/leaves");

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
    role_uuid,
    period,
  } = payload.query;

  user_uuid = payload.params.user_uuid ?? user_uuid;

  return leaveTypeRepository.getFilteredLeaveTypes(
    { search, user_uuid, role_uuid, period },
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

    const userCriteria = {};

    if (roles.length) {
      userCriteria.role_uuids = roles;
    }

    if (users.length) {
      userCriteria.user_uuids = users;
    }

    const userIds = await userRepository.listUserByCriteria(userCriteria);

    const leaveBalances = await allocateLeaveBalance(userIds, leaveType);

    const createdBalances = await leaveBalanceRepository.bulkCreate(
      leaveBalances,
      { transaction },
    );

    const leaveBalanceLogs = createdBalances.map((balance) => ({
      leave_balance_id: balance.id,
      leave_balance_deducted: balance.leaves_allocated,
      source: LeaveBalanceLogSource.ENUM.INITIAL_ALLOCATION,
    }));

    await leaveBalanceLogRepository.bulkCreate(leaveBalanceLogs, {
      transaction,
    });

    await transactionRepository.commitTransaction(transaction);

    return leaveType;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getLeaveTypeById = async (payload) => {
  const { leave_type_uuid } = payload.params;
  return leaveTypeRepository.getLeaveTypeById(leave_type_uuid);
};

exports.updateLeaveTypeById = async (payload) => {
  const { leave_type_uuid } = payload.params;

  const { roles = [], users = [], ...leaveTypePayload } = payload.body;

  const transaction = await transactionRepository.startTransaction();
  const leaveType = await leaveTypeRepository.findOne({
    uuid: leave_type_uuid,
  });

  try {
    if (leaveTypePayload) {
      await leaveTypeRepository.update(
        { uuid: leave_type_uuid },
        leaveTypePayload,
        [],
        transaction,
      );
    }

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

    const userCriteria = {};

    if (roles.length) {
      userCriteria.role_uuids = roles;
    }

    if (users.length) {
      userCriteria.user_uuids = users;
    }

    const userIds = await userRepository.listUserByCriteria(userCriteria);

    const leaveBalances = allocateLeaveBalance(userIds, leaveType);

    if (leaveBalances.length) {
      const currentPeriod = Period.getCurrentPeriod();

      const existingBalances = await leaveBalanceRepository.findAll(
        {
          user_id: { [Op.in]: leaveBalances.map((lb) => lb.user_id) },
          leave_type_id: leaveType.id,
          period: currentPeriod,
        },
        [],
        true,
        ["user_id", "leave_type_id", "period"],
        transaction,
        { raw: true },
      );

      const existingKeys = new Set(
        existingBalances.map(
          (b) => `${b.user_id}_${b.leave_type_id}_${b.period}`,
        ),
      );

      const newLeaveBalances = leaveBalances.filter(
        (lb) =>
          !existingKeys.has(`${lb.user_id}_${lb.leave_type_id}_${lb.period}`),
      );

      if (newLeaveBalances.length) {
        const createdBalances = await leaveBalanceRepository.bulkCreate(
          newLeaveBalances,
          { transaction },
        );

        const leaveBalanceLogs = createdBalances.map((balance) => ({
          leave_balance_id: balance.id,
          leave_balance_deducted: balance.leaves_allocated,
          source: LeaveBalanceLogSource.ENUM.INITIAL_ALLOCATION,
        }));

        await leaveBalanceLogRepository.bulkCreate(leaveBalanceLogs, {
          transaction,
        });
      }
    }

    await transactionRepository.commitTransaction(transaction);

    return leaveType;
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
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
  const { period, is_sealed } = payload.query;

  if (!user_uuid) {
    throw new BadRequestError("User uuid is required to fetch leave balance");
  }

  return leaveBalanceRepository.listLeaveBalance({ user_uuid, period, is_sealed });
};

exports.addSlaToLeaveBalance = async (payload) => {
  const { leave_type_uuid } = payload.params;
  const { sla, user_uuid, period } = payload.body;

  const leaveBalance = await leaveBalanceRepository.findOne({
    leave_type_id: {
      [Op.eq]: leaveBalanceRepository.getLiteralFrom(
        "leave_type",
        leave_type_uuid,
      ),
    },
    user_id: {
      [Op.eq]: leaveBalanceRepository.getLiteralFrom(
        "user",
        user_uuid,
        "user_id",
      ),
    },
    period,
  });

  if (!leaveBalance) {
    throw new BadRequestError("Leave Balance Not found.");
  }

  const previousSla = Number(leaveBalance.sla ?? 0);
  const slaDelta = Number(sla) - previousSla;

  const currentMonth = Period.getCurrentPeriod();

  const comparePeriods = Period.comparePeriods(
    currentMonth,
    leaveBalance.period,
  );

  if (comparePeriods == 1) {
    leaveBalance.final_balance = Number(leaveBalance.final_balance) + slaDelta;

    leaveBalance.sla = sla;
  } else {
    leaveBalance.balance = Number(leaveBalance.balance) + slaDelta;

    leaveBalance.sla = sla;
  }

  await leaveBalance.save();

  await leaveBalanceLogRepository.create({
    leave_request_id: null,
    leave_balance_id: leaveBalance.id,
    leave_balance_deducted: Math.abs(slaDelta),
    source: LeaveBalanceLogSource.ENUM.SLA_ALLOCATION,
  });

  const userPayroll = await payrollRepository.findOne({
    period: leaveBalance.period,
    user_id: leaveBalance.user_id,
  });

  if (userPayroll) {
    const leaveBalances = await leaveBalanceRepository.listLeaveBalance({
      period: leaveBalance.period,
      balance: { [Op.lt]: 0 },
    });

    await payrollRepository.update(
      { id: userPayroll.id },
      {
        leave_balance_deficit: leaveBalances.map((lb) => ({
          leaves_allocated: lb.leaves_allocated,
          final_balance: lb.final_balance,
          balance: lb.balance,
          name: lb.leave_type.name,
          code: lb.leave_type.code,
        })),
      },
    );
  }
};
