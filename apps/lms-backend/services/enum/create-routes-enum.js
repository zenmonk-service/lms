const { ENUM } = require("../../models/common/enum");

class CreateRoute extends ENUM {
  static ENUM = {
    CREATE_ATTENDANCE: "create_attendance",
    CREATE_USER: "create_user",
    CREATE_LEAVE_REQUEST: "create_leave_request",
    CREATE_LEAVE_TYPE: "create_leave_type",
    UPDATE_ATTENDANCE: "update_attendance",
    APPROVE_ATTENDANCE: "approve_attendance",
    CREATE_BULK_ATTENDANCE: "create_bulk_attendance",
  };
}

exports.CreateRoute = CreateRoute;
