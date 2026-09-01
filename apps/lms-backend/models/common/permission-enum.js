const { ENUM } = require("./enum");

class Permission extends ENUM {
  static ENUM = {
    USER_MANAGEMENT: "user_management",
    ATTENDANCE_REPORT_MANAGEMENT: "attendance_report_management",
    USER_ATTENDANCE_MANAGEMENT: "user_attendance_management",
    ROLE_MANAGEMENT: "role_management",
    ORGANIZATION_EVENT_MANAGEMENT: "organization_event_management",
    ORGANIZATION_HOLIDAY_MANAGEMENT: "organization_holiday_management",
    ORGANIZATION_SETTING_MANAGEMENT: "organization_setting_management",
    LEAVE_REQUEST_MANAGEMENT: "leave_request_management",
    LEAVE_REPORT_MANAGEMENT: "leave_report_management",
    LEAVE_TYPE_MANAGEMENT: "leave_type_management",
    HOLIDAY_MANAGEMENT: "holiday_management",
    PAYROLL_MANAGEMENT: "payroll_management"
  };
}

exports.Permission = Permission;
