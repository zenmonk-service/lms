const { ENUM } = require("../../models/common/enum");

class CreateRoute extends ENUM {
  static ENUM = {
    CREATE_ATTENDANCE: "create_attendance",
    CREATE_USER:'cretae_user',
    CREATE_LEAVE_REQUEST:'create_leave_request',
    CREATE_LEAVE_TYPE: 'cretae_leave_type',
    UPDATE_ATTENDANCE:'update_attendance'
  };
}

exports.CreateRoute = CreateRoute;
