const { ENUM } = require("../../../common/enum");

class LeaveRange extends ENUM {
    static ENUM = {
        FULL_DAY: "full_day",                 // used for full day leave
        FIRST_HALF: "first_half",             // for half day leave
        SECOND_HALF: "second_half",
        FIRST_QUARTER: "first_quarter",       // for short leave
        SECOND_QUARTER: "second_quarter",
        THIRD_QUARTER: "third_quarter",
        FOURTH_QUARTER: "fourth_quarter",
    };
}

exports.LeaveRange = LeaveRange;