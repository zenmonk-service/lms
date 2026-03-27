const { Op } = require("sequelize");
const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");
const {
  organizationRepository,
} = require("../repositories/organization-repository");
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
const { roleRepository } = require("../repositories/role-repository");
const {
  AccrualPeriod,
} = require("../models/tenants/leave/enum/accrual-period-enum");

exports.getFilteredLeaveTypes = async (payload) => {
  payload = await validatingQueryParameters({
    ...payload,
    repository: leaveTypeRepository,
  });
  let { order, order_column, search } = payload.query;

  const criteria = {};
  if (search) {
    criteria[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const leaveTypes = {
    rows: await leaveTypeRepository.findAll(
      criteria,
      [],
      true,
      undefined,
      undefined,
      { order: [[order_column, order]] },
    ),
    count: await leaveTypeRepository.count(criteria),
  };
  leaveTypes.current_page = 1;
  leaveTypes.per_page = leaveTypes.count;
  leaveTypes.total = leaveTypes.count;

  if (leaveTypes.rows.length) {
    leaveTypes.rows = await Promise.all(
      leaveTypes.rows.map(async (leaveType) => {
        const plainLeaveType = leaveType.get({ plain: true });

        const applicableFor = plainLeaveType.applicable_for;

        if (!applicableFor?.value?.length) {
          return plainLeaveType;
        }

        if (applicableFor.type === "employee") {
          const users = await Promise.all(
            applicableFor.value.map((userId) =>
              userRepository.getUserById(userId),
            ),
          );

          return {
            ...plainLeaveType,
            applicable_for: {
              ...applicableFor,
              value: users.filter(Boolean),
            },
          };
        }

        if (applicableFor.type === "role") {
          const roles = await Promise.all(
            applicableFor.value.map((roleId) =>
              roleRepository.getRoleById(roleId),
            ),
          );

          return {
            ...plainLeaveType,
            applicable_for: {
              ...applicableFor,
              value: roles.filter(Boolean),
            },
          };
        }

        return plainLeaveType;
      }),
    );
  }

  return leaveTypes;
};

exports.createLeaveType = async (payload) => {
  const leaveTypePayload = payload.body;
  const transaction = await transactionRepository.startTransaction();
  try {
    const leaveType = await leaveTypeRepository.create(leaveTypePayload, {
      transaction,
    });

    const applicableFor = leaveType.getApplicableFor();

    let criteria = {};
    if (applicableFor.type === "role") {
      criteria.role_id = {
        [Op.in]: applicableFor.value.map((role_uuid) =>
          userRepository.getLiteralFrom("role", role_uuid, "uuid"),
        ),
      };
    } else if (applicableFor.type == "employee") {
      criteria = { user_id: { [Op.in]: applicableFor.value } };
    } else {
      throw new Error(" Applicable for type doent exist");
    }

    const userIds = await userRepository.findAll(
      criteria,
      [],
      undefined,
      ["id"],
      transaction,
    );
    const leaveBalances =await this.allocateLeaveBalance(userIds, leaveType)

    await leaveBalanceRepository.bulkCreate(leaveBalances, { transaction });

    await transactionRepository.commitTransaction(transaction);
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.allocateLeaveBalance = async (userIds, leaveType) => {
  const today = new Date();
  if (leaveType.accrual.period == AccrualPeriod.ENUM.MONTHLY) {
    // generate 3 periods: current + next 2 months
    const periods = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() + i);

      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });

    return userIds.flatMap((user) => {
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
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentPeriod = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
    return userIds.map((user) => ({
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
  const leaveType = payload.body;
  const response = await leaveTypeRepository.updateLeaveTypeById(
    leave_type_uuid,
    leaveType,
  );
  return response;
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

exports.compromiseLeaveBalances = async (payload) => {
  const { compromised, compromising } = payload.body;

  const compromisedBalances = await leaveBalanceRepository.findAll({
    where: {
      uuid: compromised.map((e) => e.uuid),
    },
  });

  const compromisingBalances = await leaveBalanceRepository.findAll({
    where: {
      uuid: compromising.map((e) => e.uuid),
    },
  });

  const updateLeaveBalances = [];

  for (const compromised of compromisedBalances) {
    let quantity = compromised.balance;

    for (const leaveBalance of compromisingBalances) {
      if (quantity <= 0) break;

      if (quantity >= leaveBalance.balance) {
        quantity -= leaveBalance.balance;

        updateLeaveBalances.push({
          uuid: leaveBalance.uuid,
          balance: 0,
        });
      } else {
        updateLeaveBalances.push({
          uuid: leaveBalance.uuid,
          balance: leaveBalance.balance - quantity,
        });

        quantity = 0;
      }
    }

    updateLeaveBalances.push({
      uuid: compromised.uuid,
      balance: quantity,
    });
  }

  await leaveBalanceRepository.bulkUpdate(updateLeaveBalances);
};

exports.allotLeaveBalance = async (payload) => {
  const leaveTypes = await leaveTypeRepository.findAll();
};
