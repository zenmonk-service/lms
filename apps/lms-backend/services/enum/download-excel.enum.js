const { ENUM } = require("../../models/common/enum");

class DownloadExcel extends ENUM {
  static ENUM = {
  DAILY_ATTENDANCE: 'daily_attendance',
  MONTHLY_ATTENDANCE: 'monthly_attendance'
};
}

exports.DownloadExcel = DownloadExcel;
