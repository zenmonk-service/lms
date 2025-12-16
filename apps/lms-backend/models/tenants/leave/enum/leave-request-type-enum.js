const { ENUM } = require("../../../common/enum");

class LeaveRequestType extends ENUM {
    static ENUM = {
        FULL_DAY: "full_day",
        HALF_DAY: "half_day",
        SHORT_LEAVE: "short_leave",
    };
}

exports.LeaveRequestType = LeaveRequestType;