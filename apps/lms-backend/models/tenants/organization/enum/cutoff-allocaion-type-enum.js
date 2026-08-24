const { ENUM } = require("../../../common/enum");

class CutoffAllocationType extends ENUM {
  static ENUM = {
    NO_LEAVE: "no_leave",
    HALF_MONTH: "half_month",
    FULL_MONTH: "full_month",
  };
}

exports.CutoffAllocationType = CutoffAllocationType;