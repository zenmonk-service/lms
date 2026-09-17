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
    is_sealed,
  } = payload.query;

  user_uuid = payload.params.user_uuid ?? user_uuid;

  return leaveTypeRepository.getFilteredLeaveTypes(
    { search, user_uuid, role_uuid, period, is_sealed },
    { order_type: order, order_column },
  );
};

exports.createLeaveType = async (payload) => {
  const {
    roles = [],
    users = [],
    transfer_leave_type_uuid,
    ...leaveTypePayload
  } = payload.body;

  const transaction = await transactionRepository.startTransaction();
  const updatedLeaveTypePayload = {
    ...leaveTypePayload,
    transfer_leave_type_id: transfer_leave_type_uuid
      ? leaveTypeRepository.getLiteralFrom(
          "leave_type",
          transfer_leave_type_uuid,
        )
      : null,
  };
  try {
    const leaveType = await leaveTypeRepository.create(
      updatedLeaveTypePayload,
      {
        transaction,
      },
    );

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
      updated_balance: balance.leaves_allocated,
      amount: balance.leaves_allocated,
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

  const {
    roles = [],
    users = [],
    transfer_leave_type_uuid,
    ...leaveTypePayload
  } = payload.body;

  const transaction = await transactionRepository.startTransaction();

  try {
    const { rows: leaveTypes } =
      await leaveTypeRepository.getFilteredLeaveTypes(
        {
          leave_type_uuid,
        },
        {},
      );

    const leaveType = leaveTypes[0];

    if (!leaveType) {
      throw new NotFoundError(
        "Leave type not found.",
        "Leave type with provided uuid was not found.",
      );
    }

    const { roles: oldRoles = [], users: oldUsers = [] } = leaveType;
    const updatedLeaveTypePayload = {
      ...leaveTypePayload,

      transfer_leave_type_id: transfer_leave_type_uuid
        ? leaveTypeRepository.getLiteralFrom(
            "leave_type",
            transfer_leave_type_uuid,
          )
        : null,
    };

    const removedRoles = oldRoles.filter((role) => !roles.includes(role.uuid));
    const removedExplicitUsers = oldUsers.filter(
      (user) => !users.includes(user.user_id),
    );

    const removedUserCriteria = {};

    if (removedRoles.length) {
      removedUserCriteria.role_uuids = removedRoles.map((role) => role.uuid);
    }

    if (removedExplicitUsers.length) {
      removedUserCriteria.user_uuids = removedExplicitUsers.map(
        (user) => user.user_id,
      );
    }

    const removedUsers =
      await userRepository.listUserByCriteria(removedUserCriteria);

    await leaveTypeRepository.update(
      { uuid: leave_type_uuid },
      updatedLeaveTypePayload,
      [],
      transaction,
    );

    await roleLeaveTypeRepository.destroy(
      {
        leave_type_id: leaveType.id,
      },
      false,
      [],
      transaction,
    );

    if (roles.length) {
      await roleLeaveTypeRepository.bulkCreate(
        roles.map((roleUuid) => ({
          role_id: leaveTypeRepository.getLiteralFrom("role", roleUuid),
          leave_type_id: leaveType.id,
        })),
        { transaction },
      );
    }

    await userLeaveTypeRepository.destroy(
      {
        leave_type_id: leaveType.id,
      },
      false,
      [],
      transaction,
    );

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

    const activeUserCriteria = {};

    if (roles.length) {
      activeUserCriteria.role_uuids = roles;
    }

    if (users.length) {
      activeUserCriteria.user_uuids = users;
    }

    const activeUsers =
      await userRepository.listUserByCriteria(activeUserCriteria);

    const activeUserIds = [...new Set(activeUsers.map((user) => user.id))];

    const removedUserIds = [...new Set(removedUsers.map((user) => user.id))];

    const finalRemovedUserIds = removedUserIds.filter(
      (userId) => !activeUserIds.includes(userId),
    );

    const currentPeriod = Period.getCurrentPeriod();

    if (finalRemovedUserIds.length) {
      await leaveBalanceRepository.update(
        {
          user_id: {
            [Op.in]: finalRemovedUserIds,
          },

          leave_type_id: leaveType.id,

          period: currentPeriod,
        },
        {
          is_sealed: true,
        },
        [],
        transaction,
      );
    }

    if (!activeUsers.length) {
      await transactionRepository.commitTransaction(transaction);

      return leaveType;
    }

    const existingBalances = await leaveBalanceRepository.findAll(
      {
        user_id: {
          [Op.in]: activeUserIds,
        },

        leave_type_id: leaveType.id,

        period: currentPeriod,
      },
      [],
      true,
      ["user_id", "leave_type_id", "period"],
      transaction,
      {
        raw: true,
      },
    );

    const existingUserIds = [
      ...new Set(existingBalances.map((balance) => balance.user_id)),
    ];

    if (existingUserIds.length) {
      await leaveBalanceRepository.update(
        {
          user_id: {
            [Op.in]: existingUserIds,
          },

          leave_type_id: leaveType.id,

          period: currentPeriod,
        },
        {
          is_sealed: false,
        },
        [],
        transaction,
      );
    }

    const newActiveUsers = activeUsers.filter((user) => !existingUserIds.includes(user.id));

    if (activeUsers.length) {
      const leaveBalances = allocateLeaveBalance(newActiveUsers, leaveType);

      const createdBalances = await leaveBalanceRepository.bulkCreate(
        leaveBalances,
        { transaction },
      );

      const leaveBalanceLogs = createdBalances.map((balance) => ({
        leave_balance_id: balance.id,

        updated_balance: balance.leaves_allocated,

        amount: balance.leaves_allocated,

        source: LeaveBalanceLogSource.ENUM.INITIAL_ALLOCATION,
      }));

      if (leaveBalanceLogs.length) {
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

  return leaveBalanceRepository.listLeaveBalance({
    user_uuid,
    period,
    is_sealed,
  });
};

exports.getLeaveBalance = async (payload) => {
  const { leave_type_uuid } = payload.params;
  const { user_uuid, period } = payload.query;

  if (!user_uuid || !period) {
    throw new BadRequestError(
      "User uuid and period are required to fetch leave balance",
    );
  }

  const [leaveBalance] = await leaveBalanceRepository.listLeaveBalance({
    user_uuid,
    leave_type_uuid,
    period,
  });

  if (!leaveBalance) {
    throw new NotFoundError("Leave Balance not found.");
  }

  return leaveBalance;
};

exports.updateUserLeaveBalances = async (payload) => {
  const { user_uuid } = payload.params;
  const { adjustments } = payload.body;

  if (!user_uuid) {
    throw new BadRequestError("User uuid is required to fetch leave balance");
  }

  const transaction = await transactionRepository.startTransaction();

  try {
    const leaveBalanceLogsPayload = [];
    const updatedPeriods = new Map();

    for (const leaveBalance of adjustments) {
      const [, [updatedLeaveBalance]] = await leaveBalanceRepository.update(
        {
          id: {
            [Op.eq]: leaveBalanceRepository.getLiteralFrom(
              "leave_balance",
              leaveBalance.leave_balance_uuid,
            ),
          },
        },
        { balance: leaveBalance.updated_balance },
        undefined,
        transaction,
      );

      if (updatedLeaveBalance) {
        updatedPeriods.set(updatedLeaveBalance.period, updatedLeaveBalance.user_id);
      }

      leaveBalanceLogsPayload.push({
        leave_balance_id: leaveBalanceRepository.getLiteralFrom(
          "leave_balance",
          leaveBalance.leave_balance_uuid,
        ),
        updated_balance: leaveBalance.updated_balance,
        amount: leaveBalance.amount,
        source: leaveBalance.is_credit
          ? LeaveBalanceLogSource.ENUM.BALANCE_ADDITION
          : LeaveBalanceLogSource.ENUM.BALANCE_DEDUCTION,
        settled_against_leave_balance_id: leaveBalanceRepository.getLiteralFrom(
          "leave_balance",
          leaveBalance.settled_against_uuid,
        ),
      });
    }

    await leaveBalanceLogRepository.bulkCreate(leaveBalanceLogsPayload, {
      transaction,
    });

    await transactionRepository.commitTransaction(transaction);

    for (const [period, user_id] of updatedPeriods) {
      const userPayroll = await payrollRepository.findOne({ period, user_id });

      if (userPayroll) {
        const leaveBalances = await leaveBalanceRepository.listLeaveBalance({
          user_uuid,
          period,
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
    }
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
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
    updated_balance: leaveBalance.balance,
    amount: Math.abs(slaDelta),
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
