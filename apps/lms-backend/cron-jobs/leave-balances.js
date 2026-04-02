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

async function updateLeaveBalance() {
  const organizations = await organizationRepository.findAll();

  for (const organization of organizations) {
    setSchema(organization.uuid);

    const now = new Date();

    const previousMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const leaveTypes = await leaveTypeRepository.findAll({}, [], true, ["id"]);

    const leaveBalances =
      await leaveBalanceRepository.listLeaveBalancesByPeriod(previousMonth, {
        [Op.in]: leaveTypes.map((lt) => lt.id),
      });

    const positives = leaveBalances
      .filter((lb) => lb.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    const negatives = leaveBalances
      .filter((lb) => lb.balance < 0)
      .sort((a, b) => a.balance - b.balance);

    let i = 0;
    let j = 0;

    while (i < positives.length && j < negatives.length) {
      const pos = positives[i];
      const neg = negatives[j];

      const sum = pos.balance + neg.balance;

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

      return {
        user_id: lb.user_id,
        leave_type_id: lb.leave_type.id,
        leave_allocated: accrualValue,
        balance: lb.leave_type.carry_forward
          ? lb.balance + accrualValue
          : accrualValue,
        period: currentMonth,
      };
    });

    const updatedPreviousMonthBalances = adjustedBalances.map((lb) => {
      const { id, ...rest } = lb;
      return rest;
    });

    await leaveBalanceRepository.bulkCreateLeaveBalances([
      ...updatedLeaveBalance,
      ...updatedPreviousMonthBalances,
    ]);
  }
}