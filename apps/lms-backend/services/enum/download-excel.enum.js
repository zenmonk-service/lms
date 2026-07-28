const { ENUM } = require("../../models/common/enum");

class DownloadExcel extends ENUM {
  static ENUM = {
  DAILY_ATTENDANCE: "daily_attendance",
  MONTHLY_ATTENDANCE: "monthly_attendance",
  DAILY_ATTENDANCE_ANALYTICS: "daily_attendance_analytics",
  MONTHLY_ATTENDANCE_ANALYTICS: "monthly_attendance_analytics",
  MONTHLY_PAYROLL:"monthly_payroll"
};
}

exports.DownloadExcel = DownloadExcel;
