const { ENUM } = require("./enum");

class Permission extends ENUM {
  static ENUM = {
    USER_MANAGEMENT: "user_management",
    USER_LEAVE_MANAGEMENT: "user_leave_management",
    USER_ATTENDANCE_MANAGEMENT: "user_attendance_management",
    ROLE_MANAGEMENT: "role_management",
    ORGANIZATION_EVENT_MANAGEMENT: "organization_event_management",
    ORGANIZATION_HOLIDAY_MANAGEMENT: "organization_holiday_management",
    ORGANIZATION_MANAGEMENT: "organization_management",
    LEAVE_REQUEST_MANAGEMENT: "leave_request_management",
    LEAVE_TYPE_MANAGEMENT: "leave_type_management",
    LEAVE_BALANCE_MANAGEMENT: "leave_balance_management",
    HOLIDAY_MANAGEMENT: "holiday_management",
    ROLE_MANAGEMENT: "role_management",
    DEPARTMENT_MANAGEMENT: "department_management",
    ATTENDANCE_MANAGEMENT: "attendance_management",
  };
}

exports.Permission = Permission;
