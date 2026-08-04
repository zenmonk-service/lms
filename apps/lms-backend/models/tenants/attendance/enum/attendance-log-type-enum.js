const { ENUM } = require("../../../common/enum");

class AttendanceLogType extends ENUM {
  static ENUM = {
    MANUAL: "manual",
    BULK_CREATE: "bulk_create",
    SYSTEM: "system",
    UPDATE: "update",
    APPROVED: "approved"
  };
}

exports.AttendanceLogType = AttendanceLogType;
