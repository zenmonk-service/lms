const { Op } = require("sequelize");
const Period = require("../lib/period");
const { BadRequestError } = require("../middleware/error");
const {
  leaveBalanceRepository,
} = require("../repositories/leave-balance-repository");
const { payrollRepository } = require("../repositories/payroll-repository");

exports.addSlaToLeaveBalance = async (payload) => {
  const { leave_type_uuid, user_uuid, period } = payload.params;
  const { sla } = payload.body;

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
