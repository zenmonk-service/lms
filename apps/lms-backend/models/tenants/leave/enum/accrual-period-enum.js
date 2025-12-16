const { ENUM } = require("../../../common/enum");

class AccrualPeriod extends ENUM {
  static ENUM = {
    NO_ACCRUAL: "no_accrual",
    MONTHLY: "monthly",
    QUARTERLY: "quarterly",
    HALF_YEARLY: "half_yearly",
    YEARLY: "yearly",
  };
}

exports.AccrualPeriod = AccrualPeriod;
