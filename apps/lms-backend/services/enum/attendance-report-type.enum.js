const { ENUM } = require("../../models/common/enum");

class AttendanceReportType extends ENUM {
  static ENUM = {
    USER_ATTENDANCE: "user_attendance",
    MONTHLY_ATTENDANCE: "monthly_attendance",
    DAILY_ATTENDANCE: "daily_attendance",
  };
}

exports.AttendanceReportType = AttendanceReportType;
