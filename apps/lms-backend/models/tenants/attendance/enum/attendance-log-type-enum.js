const { ENUM } = require("../../../common/enum");

class AttendanceLogType extends ENUM {
  static ENUM = {
    CHECK_IN: "check_in",
    CHECK_OUT: "check_out",
    BULK_CREATE: "bulk_create",
    SYSTEM: "system",
    UPDATE: "update",
    APPROVED: "approved",
  };
}

exports.AttendanceLogType = AttendanceLogType;
