const { Op } = require("sequelize");
const { setSchema } = require("../lib/schema");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const {
  leaveTypeRepository,
} = require("../repositories/leave-type-repository");
const {
  organizationRepository,
} = require("../repositories/organization-repository");
const {
  AccrualPeriod,
} = require("../models/tenants/leave/enum/accrual-period-enum");
const Period = require("../lib/period");

exports.updateLeaveBalance = async () => {
  const organizations = await organizationRepository.findAll();

  for (const organization of organizations) {
    setSchema(organization.uuid);

    const now = new Date();
    const previousMonth = Period.getPreviousPeriod();
    const currentMonth = Period.getCurrentPeriod();

    const leaveTypes = await leaveTypeRepository.findAll({}, [], true, ["id"]);

    const leaveBalances =
      await leaveBalanceRepository.listLeaveBalancesByPeriod(
        previousMonth,
        leaveTypes.map((lt) => lt.id),
      );

    const currentMonthLeaveBalances =
      await leaveBalanceRepository.listLeaveBalancesByPeriod(
        currentMonth,
        leaveTypes.map((lt) => lt.id),
      );

    const leaveBalanceRows = leaveBalances.map((lb) => lb.get({ plain: true }));

    const positives = leaveBalanceRows
      .filter((lb) => lb.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    const negatives = leaveBalanceRows
      .filter((lb) => lb.balance < 0)
      .sort((a, b) => a.balance - b.balance);

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

    const updatedLeaveBalance = adjustedBalances.map((lb) => {
      const periodType = lb.leave_type.accrual?.period;
      const accrualValueBase = lb.leave_type.accrual?.value || 0;

      let accrualValue = 0;

      if (periodType === AccrualPeriod.ENUM.MONTHLY) {
        accrualValue = accrualValueBase;
      } else if (periodType === AccrualPeriod.ENUM.QUARTERLY) {
        const isQuarterMonth = (now.getMonth() + 1) % 3 === 0;
        accrualValue = isQuarterMonth ? accrualValueBase : 0;
      } else if (periodType === AccrualPeriod.ENUM.HALF_YEARLY) {
        const month = now.getMonth() + 1;
        const isHalfYear = month === 6 || month === 12;
        accrualValue = isHalfYear ? accrualValueBase : 0;
      } else if (periodType === AccrualPeriod.ENUM.YEARLY) {
        const isYearStart = now.getMonth() + 1 === 1;
        accrualValue = isYearStart ? accrualValueBase : 0;
      } else {
        accrualValue = 0;
      }

      const nextMonthBalance = lb.leave_type.carry_forward
        ? Number(lb.balance) + Number(accrualValue)
        : Number(accrualValue);

      const existingCurrentMonthBalance = currentMonthLeaveBalances.find(
        (leave_balance) => leave_balance.leave_type_id == lb.leave_type_id,
      );
      if (existingCurrentMonthBalance) {
        return {
          ...existingCurrentMonthBalance,
          balance:
            existingCurrentMonthBalance.balance + Math.max(0, nextMonthBalance),
          leaves_allocated: accrualValue,
        };
      } else {
        return {
          user_id: lb.user_id,
          leave_type_id: lb.leave_type_id,
          leaves_allocated: accrualValue,
          balance: Math.max(0, nextMonthBalance),
          period: currentMonth,
        };
      }
    });

    const updatedPreviousMonthBalances = adjustedBalances.map((lb) => {
      return {
        user_id: lb.user_id,
        leave_type_id: lb.leave_type_id,
        leaves_allocated: lb.leaves_allocated,
        final_balance: lb.balance,
        period: lb.period,
      };
    });

    await leaveBalanceRepository.bulkCreateLeaveBalances([
      ...updatedLeaveBalance,
      ...updatedPreviousMonthBalances,
    ]);
  }
};
