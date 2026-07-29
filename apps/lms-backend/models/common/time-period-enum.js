const { ENUM } = require("./enum");

class TimePeriod extends ENUM {
  static ENUM = {
    NONE: "none",
    MONTHLY: "monthly",
    QUARTERLY: "quarterly",
    HALF_YEARLY: "half_yearly",
    YEARLY: "yearly",
  };
}

exports.TimePeriod = TimePeriod;