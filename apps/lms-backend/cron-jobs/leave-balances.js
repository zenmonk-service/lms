const { setSchema } = require("../lib/schema");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const Period = require("../lib/period");
const { userRepository } = require("../repositories/user-repository");
const { TimePeriod } = require("../models/common/time-period-enum");

exports.updateLeaveBalance = async (organization_uuid) => {
  setSchema(organization_uuid);

  const now = new Date();
  const previousMonth = Period.getPreviousPeriod();
  const currentMonth = Period.getCurrentPeriod();

  const users = await userRepository.listUserByCriteria({
    periods: [previousMonth, currentMonth],
  });

  for (const user of users) {
    const leaveBalances = user.leave_balances.map((lb) =>
      lb.get({ plain: true }),
    );

    const previousMonthLeaveBalances = leaveBalances.filter(
      (lb) => lb.period === previousMonth,
    );

    const currentMonthLeaveBalances = leaveBalances.filter(
      (lb) => lb.period === currentMonth,
    );

    const positives = previousMonthLeaveBalances
      .filter((lb) => Number(lb.balance) > 0)
      .sort((a, b) => Number(b.balance) - Number(a.balance));

    const negatives = previousMonthLeaveBalances
      .filter((lb) => Number(lb.balance) < 0)
      .sort((a, b) => Number(a.balance) - Number(b.balance));

    let i = 0;
    let j = 0;

    while (i < positives.length && j < negatives.length) {
      const pos = positives[i];
      const neg = negatives[j];

      const sum = Number(pos.balance) + Number(neg.balance);

      if (sum >= 0) {
        pos.balance = sum;
        neg.balance = 0;
        j++;
      } else {
        neg.balance = sum;
        pos.balance = 0;
        i++;
      }
    }

    const adjustedBalances = [...positives, ...negatives];

    const updatedCurrentMonthBalances = adjustedBalances.map((lb) => {
      const periodType = lb.leave_type.accrual?.period;
      const accrualValueBase = Number(lb.leave_type.accrual?.value || 0);

      let accrualValue = 0;

      switch (periodType) {
        case TimePeriod.ENUM.MONTHLY:
          accrualValue = accrualValueBase;
          break;

        case TimePeriod.ENUM.QUARTERLY:
          accrualValue = (now.getMonth() + 1) % 3 === 0 ? accrualValueBase : 0;
          break;

        case TimePeriod.ENUM.HALF_YEARLY:
          accrualValue = [6, 12].includes(now.getMonth() + 1)
            ? accrualValueBase
            : 0;
          break;

        case TimePeriod.ENUM.YEARLY:
          accrualValue = now.getMonth() + 1 === 1 ? accrualValueBase : 0;
          break;
      }

      const nextMonthBalance = lb.leave_type.carry_forward
        ? Number(lb.balance) + accrualValue
        : accrualValue;

      const existingCurrentMonthBalance = currentMonthLeaveBalances.find(
        (balance) => balance.leave_type_id === lb.leave_type_id,
      );

      return {
        user_id: lb.user_id,
        leave_type_id: lb.leave_type_id,
        period: currentMonth,
        leaves_allocated: nextMonthBalance,
        balance:
          Math.max(0, nextMonthBalance) +
          Number(existingCurrentMonthBalance?.balance || 0),
      };
    });

    const updatedPreviousMonthBalances = adjustedBalances.map((lb) => ({
      user_id: lb.user_id,
      leave_type_id: lb.leave_type_id,
      leaves_allocated: lb.leaves_allocated,
      balance: lb.balance,
      final_balance: lb.balance,
      period: lb.period,
    }));

    await leaveBalanceRepository.bulkCreateLeaveBalances([
      ...updatedCurrentMonthBalances,
      ...updatedPreviousMonthBalances,
    ]);
  }
};
