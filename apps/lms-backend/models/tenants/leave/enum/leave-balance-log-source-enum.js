const { ENUM } = require("../../../common/enum");

class LeaveBalanceLogSource extends ENUM {
  static ENUM = {
    LEAVE_APPROVED: "leave_approved",
    SLA_ALLOCATION: "sla_allocation",
    INITIAL_ALLOCATION: "initial_allocation",
    ACCRUAL: "accrual",
    ROLLOVER: "rollover",
    BALANCE_ADDITION: "balance_addition",

    BALANCE_DEDUCTION: "balance_deduction",
  };
}

exports.LeaveBalanceLogSource = LeaveBalanceLogSource;
