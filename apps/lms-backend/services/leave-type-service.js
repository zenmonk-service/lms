const { Op } = require("sequelize");
const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");
const Period = require("../lib/period");
const { BadRequestError } = require("../middleware/error");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
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
const { TimePeriod } = require("../models/common/time-period-enum");

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
  if (leaveType.accrual.period == TimePeriod.ENUM.MONTHLY) {
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
  console.log("leaveBalance: ", leaveBalance);

  const currentMonth = Period.getCurrentPeriod();

  const comparePeriods = Period.comparePeriods(
    currentMonth,
    leaveBalance.period,
  );

  if (comparePeriods == 1) {
    leaveBalance.final_balance =
      Number(leaveBalance.final_balance) + (sla - (leaveBalance.sla ?? 0));

    leaveBalance.sla = sla;
  } else {
    leaveBalance.balance =
      Number(leaveBalance.balance) + (sla - (leaveBalance.sla ?? 0));

    leaveBalance.sla = sla;
  }

  await leaveBalance.save();

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
