const { ENUM } = require("../../../common/enum");

class LeaveBalanceLogSource extends ENUM {
  static ENUM = {
    // A leave request was approved.
    LEAVE_APPROVED: "leave_approved",
    // A special SLA was allocated / changed for a user + period.
    SLA_ALLOCATION: "sla_allocation",
    // Balance rows freshly created (leave type created, made applicable to
    // more users, or a new user onboarded).
    INITIAL_ALLOCATION: "initial_allocation",
    // Monthly accrual added to the current period by the rollover cron.
    ACCRUAL: "accrual",
    // Previous period netted / sealed into final_balance by the rollover cron.
    ROLLOVER: "rollover",
  };
}

exports.LeaveBalanceLogSource = LeaveBalanceLogSource;
