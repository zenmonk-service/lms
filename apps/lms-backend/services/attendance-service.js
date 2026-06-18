const {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} = require("../middleware/error");
const {
  attendanceLogRepository,
} = require("../repositories/attendance-log-repository");
const {
  attendanceRepository,
} = require("../repositories/attendance-repository");
const { userRepository } = require("../repositories/user-repository");
const {
  transactionRepository,
} = require("../repositories/transaction-repository");
const {
  AttendanceLogType,
} = require("../models/tenants/attendance/enum/attendance-log-type-enum");
const {
  AttendanceStatus,
} = require("../models/tenants/attendance/enum/attendance-status-enum");
const { Op, fn, col, literal } = require("sequelize");
const { AttendanceReportType } = require("./enum/attendance-report-type.enum");
const db = require("../models");
const { getSchema } = require("../lib/schema");
const XLSX = require("xlsx");
const Period = require("../lib/period");
const {
  organizationSettingRepository,
} = require("../repositories/organization-setting-repository");

exports.validateBodyParameters = async (payload) => {
  let { check_in, check_out, attendance_log } = payload.body;

  if (!check_in && check_out)
    throw BadRequestError(
      "check_in and check_out both required or none of them",
    );
  if (attendance_log && !Array.isArray(attendance_log)) {
    payload.body.attendance_log = attendance_log.split(",");
  }
  return payload;
};

exports.recordUserCheckIn = async (payload) => {
  const { user_uuid } = payload.params;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById(user_uuid);
  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );
  if (!user.isActive()) throw new ForbiddenError("User is currently inactive.");

  const transaction = await transactionRepository.startTransaction();
  try {
    let attendance = await attendanceRepository.getAttendanceByCriteria({
      user_uuid,
      date: new Date(),
    });

    if (attendance) {
      if (attendance.isOnLeaveOrHoliday())
        throw new BadRequestError(
          "Check_In not Allowed",
          "Contact your administrator",
        );
      if (attendance.isCheckedIn())
        throw new BadRequestError(
          "Already Checked In",
          "User has already checked in for today",
        );
      else {
        attendance.markCheckIn();
        await attendance.save();
        await attendanceLogRepository.createAttendanceLog(
          {
            attendance_id: attendance.id,
            location,
            type: AttendanceLogType.ENUM.CHECK_IN,
          },
          transaction,
        );
        await transactionRepository.commitTransaction(transaction);
        return attendance;
      }
    } else {
      attendance = await attendanceRepository.createAttendance(
        user_uuid,
        transaction,
      );
      await attendanceLogRepository.createAttendanceLog(
        {
          attendance_id: attendance[0].id,
          location,
          type: AttendanceLogType.ENUM.CHECK_IN,
        },
        transaction,
      );
      await transactionRepository.commitTransaction(transaction);
      return attendance;
    }
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.recordUserCheckOut = async (payload) => {
  const { user_uuid } = payload.params;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById(user_uuid);
  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );

  if (!user.isActive()) throw new ForbiddenError("User is currently inactive.");

  const attendance = await attendanceRepository.getAttendanceByCriteria({
    user_uuid,
    date: new Date(),
  });

  if (!attendance)
    throw new NotFoundError(
      "Attendance not found",
      "User attendance for today not found",
    );

  if (!attendance.isCheckedOut())
    throw new BadRequestError(
      "Already Checked Out",
      "User has already checked out for today",
    );

  const transaction = await transactionRepository.startTransaction();

  try {
    await attendanceLogRepository.createAttendanceLog(
      {
        attendance_id: attendance.id,
        location,
        type: AttendanceLogType.ENUM.CHECK_OUT,
      },
      transaction,
    );

    attendance.markCheckOut();
    await transactionRepository.commitTransaction(transaction);
    return attendance.save();
  } catch (error) {
    await transactionRepository.rollbackTransaction(transaction);
    throw error;
  }
};

exports.getFilteredAttendance = async (payload) => {
  const {
    user_uuid,
    date,
    date_range,
    organization_role_uuid,
    department_uuid,
    status,
    page = 1,
    limit = 10,
  } = payload.query;
  return attendanceRepository.getFilteredAttendance(
    {
      user_uuid,
      date,
      date_range,
      organization_role_uuid,
      department_uuid,
      status,
    },
    { page, limit },
  );
};

exports.recordAttendance = async (payload) => {
  const { user_uuid, date, check_in, check_out, status } = payload.body;
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;
  const user = await userRepository.getUserById(user_uuid);

  if (!user)
    throw new NotFoundError(
      "User not found",
      "User with provided uuid not found",
    );
  if (
    !(
      user.isActive() &&
      user.organization.isActive() &&
      user.department.isActive() &&
      user.organization_role?.isActive()
    )
  ) {
    throw new ForbiddenError("User is currently inactive.");
  }
  if (!check_in)
    throw new BadRequestError("Invalid Check In", "Check in time is required");

  const transaction = await transactionRepository.startTransaction();
  try {
    const attendance = await attendanceRepository.recordAttendance(
      { user_uuid, date },
      { check_in, check_out, status },
      transaction,
    );

    if (
      status != AttendanceStatus.ENUM.ABSENT ||
      (attendance.isOnLeaveOrHoliday() && (check_in || check_out))
    ) {
      await attendanceLogRepository.recordAttendanceLog(
        {
          attendance_id: attendance[0].id,
          location,
          updates: { check_in, check_out },
        },
        transaction,
      );
    }

    await transactionRepository.commitTransaction(transaction);
    return attendance;
  } catch (error) {
    if (!transaction.finished) {
      await transactionRepository.rollbackTransaction(transaction);
    }
    throw error;
  }
};

exports.bulkCreateAttendanceWithExcel = async (payload) => {
  const workbook = XLSX.read(payload.file.buffer, {
    type: "buffer",
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  const headerRowIndex = rows.findIndex((row) =>
    row.some((cell) => String(cell).trim().toLowerCase() === "emp code"),
  );

  if (headerRowIndex === -1) {
    throw new Error("Could not find attendance table");
  }

  const header = rows[headerRowIndex];

  const empCodeIndex = header.findIndex(
    (x) => String(x).trim().toLowerCase() === "emp code",
  );

  const inTimeIndex = header.findIndex(
    (x) => String(x).trim().toLowerCase() === "in time",
  );

  const outTimeIndex = header.findIndex(
    (x) => String(x).trim().toLowerCase() === "out time",
  );

  const statusIndex = header.findIndex(
    (x) => String(x).trim().toLowerCase() === "work status",
  );

  const attendances = [];

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];

    const empCode = row[empCodeIndex];

    if (!empCode) continue;
    if (String(empCode).trim() === "EMP Code") continue;
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(empCode))) continue;
    if (isNaN(Number(empCode))) continue;

    attendances.push({
      emp_code: String(empCode),
      date: Period.convertDate(row[inTimeIndex] ?? row[outTimeIndex]),
      check_in: excelSerialToTime(row[inTimeIndex]),
      check_out: excelSerialToTime(row[outTimeIndex]),
    });
  }

  const orgSetting = await organizationSettingRepository.findOne();
  const attendancePayload = attendances.map((attendance) => {
    const { check_in, check_out, date, emp_code } = attendance;
    const compare = Period.comparePeriods(
      attendance.date,
      Period.getCurrentPeriod(),
    );
    let status = AttendanceStatus.ENUM.PRESENT;
    if (orgSetting) {
      if (attendance.check_in && orgSetting.start_time > attendance.check_in) {
        status = AttendanceStatus.ENUM.LATE;
      }

      if (check_in && check_out) {
        if (
          check_out - check_in <
          orgSetting.end_time - orgSetting.start_time
        ) {
          status = AttendanceStatus.ENUM.EARLY_DEPARTURE;
        }
      }

      if (compare == -1) {
        if (check_in && !check_out) {
          status = AttendanceStatus.ENUM.MISSED_PUNCH;
        }
      }
    }

    return {
      user_id: attendanceRepository.getLiteralFrom(
        "user",
        attendance.emp_code,
        "emp_code",
      ),
      check_in: attendance.check_in,
      check_out: attendance.check_out,
      date: attendance.date,
      status: status,
    };
  });
  return attendanceRepository.bulkCreateAttendances(attendancePayload);
};

exports.bulkCreateAttendances = async (payload) => {
  payload = await this.validateBodyParameters(payload);
  const location =
    payload.headers["x-forwarded-for"] || payload.connection.remoteAddress;

  const attendanceRecordsPayload = await Promise.all(
    payload.body.map(async (attendance) => {
      const user = await userRepository.getUserById(attendance.user_uuid);
      if (
        !(
          user.isActive() &&
          user.organization.isActive() &&
          user.department.isActive() &&
          user.organization_role?.isActive()
        )
      )
        throw new ForbiddenError("User is currently inactive.");

      const record = {
        user_id: attendanceRepository.getLiteralFrom(
          "user",
          attendance.user_uuid,
          "user_id",
        ),
        check_in: attendance.check_in,
        check_out: attendance.check_out,
        date: attendance.date,
        status: attendance.status,
        affected_hours: attendance.affected_hours,
        attendance_log: [],
      };

      if (attendance.check_in) {
        record.attendance_log.push({
          time: attendance?.check_in,
          type: AttendanceLogType.ENUM.CHECK_IN,
          location,
        });
      }

      if (attendance.check_out) {
        record.attendance_log.push({
          time: attendance?.check_out,
          type: AttendanceLogType.ENUM.CHECK_OUT,
          location,
        });
      }

      if (attendance.attendance_log) {
        record.attendance_log = attendance.attendance_log;
      }

      return record;
    }),
  );

  return attendanceRepository.bulkCreateAttendances(attendanceRecordsPayload);
};

exports.getAttendanceByCriteria = async (payload) => {
  const { user_uuid } = payload.params;
  return attendanceRepository.getAttendanceByCriteria({
    user_uuid,
    date: new Date(),
  });
};

exports.listAttendanceReport = async (payload) => {
  const { type } = payload.query;

  switch (type) {
    case AttendanceReportType.ENUM.USER_ATTENDANCE:
      return await this.listUserAttendance(payload);

    case AttendanceReportType.ENUM.DAILY_ATTENDANCE:
      return await this.getDailyAttendanceCount(payload);

    case AttendanceReportType.ENUM.MONTHLY_ATTENDANCE:
      return await this.getMonthlyAttendanceCount(payload);

    default: {
      const userAttendance = await this.listUserAttendance(payload);
      const dailyAttendance = await this.getDailyAttendanceCount(payload);
      const monthlyAttendance = await this.getMonthlyAttendanceCount(payload);

      return {
        ...userAttendance,
        ...dailyAttendance,
        ...monthlyAttendance,
      };
    }
  }
};

exports.listUserAttendance = async (payload) => {
  let { month_filter, search, page, limit, date, status } = payload.query;

  if (!month_filter) {
    month_filter = new Date().toISOString().slice(0, 7);
  }

  const startDate = `${month_filter}-01`;

  const endDate = new Date(
    Number(month_filter.split("-")[0]),
    Number(month_filter.split("-")[1]),
    0,
  )
    .toISOString()
    .split("T")[0];

  const response = await userRepository.listUserAttendanceReport(
    { startDate, endDate, month: month_filter, date, status },
    { search, page, limit },
  );
  return { user_attendance_report: response };
};

exports.getDailyAttendanceCount = async (payload) => {
  let { date } = payload.query;
  console.log("date: ", date);

  if (!date) {
    const today = new Date();
    date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }

  const response = await attendanceRepository.findOne(
    {
      date,
    },
    [],
    true,
    [
      [
        fn(
          "COUNT",
          literal(
            `CASE WHEN status = '${AttendanceStatus.ENUM.PRESENT}' THEN 1 END`,
          ),
        ),
        "present_count",
      ],
      [
        fn(
          "COUNT",
          literal(
            `CASE WHEN status = '${AttendanceStatus.ENUM.ABSENT}' THEN 1 END`,
          ),
        ),
        "absent_count",
      ],
      [
        fn(
          "COUNT",
          literal(
            `CASE WHEN status = '${AttendanceStatus.ENUM.ON_LEAVE}' THEN 1 END`,
          ),
        ),
        "on_leave_count",
      ],
      [
        fn(
          "COUNT",
          literal(
            `CASE WHEN status = '${AttendanceStatus.ENUM.LATE}' THEN 1 END`,
          ),
        ),
        "late_count",
      ],
    ],
  );

  return {
    daily_attendance_report: response,
  };
};
exports.getMonthlyAttendanceCount = async (payload) => {
  let { start_month, end_month } = payload.query;

  let startDate, endDate;

  if (start_month && end_month) {
    const [startMonth, startYear] = start_month.split("-");
    const [endMonth, endYear] = end_month.split("-");

    startDate = new Date(startYear, startMonth - 1, 1);

    endDate = new Date(endYear, endMonth, 0);
  } else {
    const today = new Date();

    startDate = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  }
  const response = await attendanceRepository.getMonthlyAttendanceReport(
    startDate,
    endDate,
  );
  return { monthly_attendance_report: response };
};
