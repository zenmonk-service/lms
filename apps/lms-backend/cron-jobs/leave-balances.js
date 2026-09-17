const { setSchema } = require("../lib/schema");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const {
  leaveBalanceLogRepository,
} = require("../repositories/leave-balance-log-repository");
const {
  LeaveBalanceLogSource,
} = require("../models/tenants/leave/enum/leave-balance-log-source-enum");
const Period = require("../lib/period");
const { userRepository } = require("../repositories/user-repository");
const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");
const { isPeriodApplicable } = require("../lib/constants");

exports.updateLeaveBalance = async (organization_uuid) => {
  setSchema(organization_uuid);

  const currentPeriod = Period.getCurrentPeriod();
  const nextPeriod = Period.getNextPeriod();

  const users = await userRepository.listUserByCriteria({
    periods: [currentPeriod, nextPeriod],
    is_sealed: false,
  });

  for (const user of users) {
    const leaveBalances = user.leave_balances.map((lb) =>
      lb.get({ plain: true }),
    );

    const currentMonthLeaveBalances = leaveBalances.filter(
      (lb) => lb.period === currentPeriod,
    );

    const nextMonthLeaveBalances = leaveBalances.filter(
      (lb) => lb.period === nextPeriod,
    );

    const currentBalanceMap = new Map(
      currentMonthLeaveBalances.map((lb) => [
        lb.leave_type_id,
        Number(lb.balance),
      ]),
    );

    const nextBalanceMap = new Map(
      nextMonthLeaveBalances.map((lb) => [lb.leave_type_id, lb]),
    );

    const leaveTypes = await leaveTypeRepository.getFilteredLeaveTypes({
      role_uuid: user.role_uuid,
      period: nextPeriod,
      is_sealed: false,
      user_uuid: user.user_id,
    });

    const nextMonthBalances = leaveTypes.map((leaveType) => {
      const accrualValue = isPeriodApplicable(leaveType.accrual?.period)
        ? Number(leaveType.accrual?.value || 0)
        : 0;

      const currentBalance = currentBalanceMap.get(leaveType.id) || 0;

      const rollover =
        leaveType.carry_forward && currentBalance > 0 ? currentBalance : 0;

      const existingNextBalance = nextBalanceMap.get(leaveType.id);

      const existingBalance = Number(existingNextBalance?.balance || 0);

      const balance = existingBalance + rollover + accrualValue;

      return {
        id: existingNextBalance?.id,
        user_id: user.id,
        leave_type_id: leaveType.id,
        period: nextPeriod,
        leaves_allocated: existingNextBalance?.leaves_allocated ?? balance,
        balance,
      };
    });

    const balancesToUpdate = [
      ...currentMonthLeaveBalances.map((lb) => ({
        id: lb.id,
        user_id: lb.user_id,
        leave_type_id: lb.leave_type_id,
        period: currentPeriod,
        leaves_allocated: lb.leaves_allocated,
        balance: lb.balance,
        final_balance: lb.balance,
        is_sealed: true,
      })),

      ...nextMonthBalances,
    ];

    const upsertedBalances =
      await leaveBalanceRepository.bulkCreateLeaveBalances(balancesToUpdate);

    const balanceLogs = (upsertedBalances || [])
      .map((row) => {
        if (row.period !== nextPeriod) {
          return null;
        }

        const previousBalance = Number(
          nextBalanceMap.get(row.leave_type_id)?.balance || 0,
        );

        const updatedBalance = Number(row.balance);

        const delta = updatedBalance - previousBalance;

        if (delta === 0) {
          return null;
        }

        return {
          leave_balance_id: row.id,
          updated_balance: Math.abs(delta),
          source:
            delta > 0
              ? LeaveBalanceLogSource.ENUM.ACCRUAL
              : LeaveBalanceLogSource.ENUM.ROLLOVER,
        };
      })
      .filter(Boolean);

    if (balanceLogs.length) {
      await leaveBalanceLogRepository.bulkCreate(balanceLogs);
    }
  }
};
