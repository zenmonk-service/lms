const { BadRequestError } = require("../middleware/error");
const { isValidUUID, isValidTime } = require("../models/common/validator");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const {
  EmployementType,
} = require("../models/tenants/user/enum/employment-type-enum");
const { WorkMode } = require("../models/tenants/user/enum/work-mode-enum");
const {
  CreateBulkAttendance,
} = require("../services/enum/create-bulk-attendance-enum");
const { CreateRoute } = require("../services/enum/create-routes-enum");

exports.validateBodyParameters = async (data) => {
  const { payload, route } = data;

  switch (route) {
    case CreateRoute.ENUM.CREATE_USER: {
      const {
        name,
        emp_code,
        email,
        role_uuid,
        shift_uuid,
        past_dated_leave_balance,
        employment_type,
        is_active,
        work_mode,
      } = payload.body;

      if (!name) throw new BadRequestError("Name is required.");

      if (!emp_code) throw new BadRequestError("Emp Code is required.");

      if (!email) throw new BadRequestError("Email is required.");

      if (!role_uuid) throw new BadRequestError("Role is required.");

      if (
        employment_type &&
        !EmployementType.getValues().includes(employment_type)
      ) {
        throw new BadRequestError(
          `Employment Type must be one of: ${EmployementType.getValues().join(", ")}`,
        );
      }
      if (work_mode && !WorkMode.getValues().includes(work_mode)) {
        throw new BadRequestError(
          `Work Mode must be one of: ${WorkMode.getValues().join(", ")}`,
        );
      }
      if (
        past_dated_leave_balance !== undefined &&
        typeof past_dated_leave_balance !== "number"
      ) {
        throw new BadRequestError("Past dated leave balance must be a number.");
      }

      if (is_active !== undefined && typeof is_active !== "boolean") {
        is_active = String(is_active).toLowerCase() === "true";
      }

      if (shift_uuid && !isValidUUID(shift_uuid)) {
        throw new BadRequestError("invalid shift uuid.");
      }
      if (role_uuid && !isValidUUID(role_uuid)) {
        throw new BadRequestError("invalid role uuid.");
      }
      break;
    }

    case CreateRoute.ENUM.CREATE_ATTENDANCE: {
      let { check_in, check_out, attendance_log } = payload.body;

      if (!check_in && check_out)
        throw new BadRequestError(
          "check_in and check_out both required or none of them",
        );

      if (attendance_log && !Array.isArray(attendance_log)) {
        payload.body.attendance_log = attendance_log.split(",");
      }

      break;
    }

    case CreateRoute.ENUM.UPDATE_ATTENDANCE: {
      const { check_in, check_out, status } = payload.body;

      if (check_in && !isValidTime(check_in)) {
        throw new BadRequestError("check_in is not valid time");
      }

      if (check_out && !isValidTime(check_out)) {
        throw new BadRequestError("check_out is not valid time");
      }
      if (status && !AttendanceStatus.getValues().includes(status)) {
        throw new BadRequestError(
          `Attendance Status must be one of: ${AttendanceStatus.getValues().join(", ")}`,
        );
      }
      break;
    }

    case CreateRoute.ENUM.CREATE_BULK_ATTENDANCE: {
      const { date, attendances, type, status, remarks } = payload.body;

      if (!CreateBulkAttendance.isValidValue(type)) {
        throw new BadRequestError(
          `Type must be one of: ${CreateBulkAttendance.getValues().join(", ")}`,
        );
      }

      if (!date) {
        throw new BadRequestError("date is required");
      }

      if (type === CreateBulkAttendance.ENUM.EXCEL_UPLOAD) {
        if (!Array.isArray(attendances) || attendances.length === 0) {
          throw new BadRequestError("attendances is required for excel upload");
        }
      }

      if (type === CreateBulkAttendance.ENUM.MANUAL_UPLOAD) {
        if (!status) {
          throw new BadRequestError("status is required for manual upload");
        }

        if (!AttendanceStatus.getValues().includes(status)) {
          throw new BadRequestError(
            `Attendance status must be one of: ${AttendanceStatus.getValues().join(
              ", ",
            )}`,
          );
        }
      }

      if (remarks && typeof remarks !== "string") {
        throw new BadRequestError("remarks must be a string");
      }

      break;
    }
  }
};
