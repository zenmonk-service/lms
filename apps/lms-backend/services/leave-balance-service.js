const Period = require("../lib/period");
const { getSchema } = require("../lib/schema");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");

exports.addSlaToLeaveBalance = async (payload) => {
  const { leave_balance_uuid } = payload.params;
  const { sla } = payload.body;

  const leaveBalance = await leaveBalanceRepository.findOne({
    uuid: leave_balance_uuid,
  });

  const currentMonth = Period.getCurrentPeriod();

  const comparePeriods = Period.comparePeriods(
    currentMonth,
    leaveBalance.period,
  );

  if (comparePeriods == 1) {
    leaveBalance.final_balance += sla - leaveBalance?.sla;
    leaveBalance.sla = sla;
  } else {
    leaveBalance.balance += sla - leaveBalance?.sla;
    leaveBalance.sla = sla;
  }

  await leaveBalance.save();
};
