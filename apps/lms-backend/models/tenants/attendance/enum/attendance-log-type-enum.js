const { ENUM } = require("../../../common/enum");

class AttendanceLogType extends ENUM {
  static ENUM = {
    CHECK_IN: "check_in",
    CHECK_OUT: "check_out",
    UPDATE: "update",
    BULK_CREATE: "bulk_create",
    EARLY_DEPARTURE: "early_departure",
    HALF_DAY: "half_day",
    MISSED_PUNCH: "missed_punch",
    LATE: "late",
    SHORT_LEAVE: "short_leave",
    ON_LEAVE: "on_leave",
    ABSENT: "absent",
  };
}

exports.AttendanceLogType = AttendanceLogType;
