const { ENUM } = require("../../models/common/enum");

class CreateBulkAttendance extends ENUM {
  static ENUM = {
    MANUAL_UPLOAD: "manual_upload",
    EXCEL_UPLOAD: "excel_upload",
  };
}

exports.CreateBulkAttendance = CreateBulkAttendance;
